import createExpress from './express';
import bodyParser from 'body-parser';
import MongoEntity from './mongo/Entity';
import MongoSingleton from './mongo/Singleton';
import Entity from './odata/entity/Entity';
import Func from './ODataFunction';
import Metadata from './odata/Metadata';
import ServiceDocument from './odata/ServiceDocument';
import Batch from './odata/Batch';
import Action from './odata/Action';
import error from './middlewares/error';
import writer from './middlewares/writer';
import Hooks from './odata/Hooks';
import multipartMixed from './parser/multipartMixed';
import Singleton from './odata/entity/Singleton';
import Vocabulary from './odata/Vocabulary';

function checkAuth(auth, req) {
  return !auth || auth(req);
}

class Server {
  constructor(prefix, options) {
    const opts = (options && options.expressRequestLimit)
      ? { limit: options.expressRequestLimit } : {};

    this._app = createExpress(options);
    this._settings = {
      maxTop: 10000,
      maxSkip: 10000,
      orderby: undefined,
    };
    this.defaultConfiguration(prefix);

    this.hooks = new Hooks();

    // TODO: Infact, resources is a mongooseModel instance, origin name is repositories.
    // Should mix _resources object and resources object: _resources + resource = resources.
    // Encapsulation to a object, separate mognoose, try to use *repository pattern*.
    // 这里也许应该让 resources 支持 odata 查询的, 以方便直接在代码中使用 OData 查询方式来进行数据筛选, 达到隔离 mongo 的效果.
    this.resources = {
      $metadata: new Metadata(this),
      $batch: new Batch(this),
    };
    //unbound actions
    this.actions = {};

    this.hooks.addBefore(multipartMixed);
    this.hooks.addBefore(bodyParser.json(opts));
    this.hooks.addBefore(async (req, res) => {
      req.$odata = {
        $metadata: this.resources.$metadata
      };
      res.$odata = {
        status: 404,
        supportedMimetypes: ['application/json'],
        messages: []
      }
    }, 'service-initialization');
    this.hooks.addAfter(writer, 'writer', true);

    this._serviceDocument = new ServiceDocument(this);
    this.annotations = new Vocabulary();
    this.error = error;
  }

  vocabulary() {
    return this.annotations;
  }

  addBefore(fn, name) {
    this.hooks.addBefore(fn, name);
  }

  addAfter(fn, name) {
    this.hooks.addAfter(fn, name);
  }

  function(url, middleware, params) {
    const func = new Func(url.replace(/[ /]+/, ''), middleware, params);

    this.resources[func.getName()] = func;
  }

  entity(name, handler, metadata, settings) {
    if (this.resources[name]) {
      throw new Error(`Entity with name "${name}" already defined`);
    }

    this.resources[name] = new Entity(name, handler, metadata, {
      maxSkip: this._settings.maxSkip, //TODO: Validation of possible Mappings
      maxTop: this._settings.maxTop,
      orderby: this._settings.orderby,
      ...settings
    }, this.annotations);

    return this.resources[name];
  }

  mongoEntity(name, model, handler, metadata, settings, registerComplexTypes = true) {
    if (name && !model) {
      if (!this.resources[name]) {
        throw new Error(`Entity '${name}' is not defined`);
      }
      return this.resources[name];
    }

    const mongoEntity = new MongoEntity(name, model, this.annotations);

    if (registerComplexTypes) {
      const complexTypes = mongoEntity.getComplexTypes();

      if (complexTypes) {
        Object.keys(complexTypes)
          .forEach(typeName => {
            const type = complexTypes[typeName];

            this.complexType(typeName, type);
          });
      }
    }

    const entity = this.entity(name, {
      ...mongoEntity.getHandler(),
      ...handler
    }, {
      ...mongoEntity.getMetadata(),
      ...metadata
    }, settings);

    entity.mapping = mongoEntity.mapping;

    return entity;
  }

  singleton(name, handler, metadata) {
    if (this.resources[name]) {
      throw new Error(`Entity with name "${name}" already defined`);
    }

    this.resources[name] = new Singleton(name, handler, metadata, this.annotations);

    return this.resources[name];
  }

  singletonFrom(name, handler, entity) {
    if (this.resources[name]) {
      throw new Error(`Entity with name "${name}" already defined`);
    }

    this.resources[name] = new Singleton(name, handler, entity, this.annotations);

    return this.resources[name];
  }

  mongoSingleton(name, model, handler, metadata) {
    if (name && !model) {
      if (!this.resources[name]) {
        throw new Error(`Entity '${name}' is not defined`);
      }
      return this.resources[name];
    }

    const entity = new MongoSingleton(name, model, this.annotations);

    const complexTypes = entity.entity.getComplexTypes();

    if (complexTypes) {
      Object.keys(complexTypes)
        .forEach(typeName => {
          const type = complexTypes[typeName];

          this.complexType(typeName, type);
        });
    }

    const singletonEntity = this.singleton(name, {
      ...entity.getHandler(),
      ...handler
    }, {
      ...entity.entity.getMetadata(),
      ...metadata
    });

    singletonEntity.mapping = {
      ...singletonEntity.mapping,
      ...entity.mapping
    }
    return singletonEntity;
  }

  defaultConfiguration(prefix = '') {
    this.set('app', this._app);
    this.set('prefix', prefix);
  }

  action(name, fn, options) {
    this.actions[name] = new Action(name, fn, this.annotations, options);

    return this.actions[name];
  }

  getRouter() {
    const result = [];

    result.push(this._serviceDocument._router());

    Object.keys(this.resources).forEach((resourceKey) => {
      const resource = this.resources[resourceKey];

      result.push(resource._router ? resource._router() : resource.getRouter());

      if (resource.actions) {
        Object.keys(resource.actions).forEach((actionKey) => {
          const action = resource.actions[actionKey];

          result.push(action.getRouter());
        });
      }
    });

    Object.keys(this.actions).forEach(actionKey => {
      const action = this.actions[actionKey];

      result.push(action.getRouter());
    });

    return [...this.hooks.before, ...result, ...this.hooks.after, this.error];
  }

  complexType(name, properties) {
    if (!properties) {
      throw new Error('Metadata for complex type should be given');
    }
    return this.resources.$metadata.complexType(name, properties);
  }

  listen(...args) {
    const router = this.getRouter();

    router.forEach((item) => {
      this._app.use(this.get('prefix'), item);
    });

    return this._app.listen(...args);
  }

  get(key) {
    return this._settings[key];
  }

  set(key, val) {
    switch (key) {
      case 'prefix': {
        let prefix = val;
        if (prefix === '/') {
          prefix = '';
        }
        if (prefix.length > 0 && prefix[0] !== '/') {
          prefix = `/${prefix}`;
        }
        this._settings[key] = prefix;
        break;
      }
      default: {
        this._settings[key] = val;
        if (this.resources) {
          Object.keys(this.resources)
            .forEach(name => {
              if (this.resources[name].set) {
                this.resources[name].set(key, val);
              }
            });
        }
        break;
      }
    }
    return this;
  }

  engine(...args) {
    this._app.engine(...args);
  }
}

export default Server;
