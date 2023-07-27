import createExpress from './express';
import MongoEntity from './mongo/Entity';
import Entity from './odata/entity/Entity';
import Func from './ODataFunction';
import Metadata from './odata/Metadata';
import ServiceDocument from './odata/ServiceDocument';
import Batch from './odata/Batch';
import Action from './odata/Action';
import error from './middlewares/error';
import writer from './middlewares/writer';
import Hooks from './odata/Hooks';

function checkAuth(auth, req) {
  return !auth || auth(req);
}

class Server {
  constructor(prefix, options) {
    this._app = createExpress(options);
    this._settings = {
      maxTop: 10000,
      maxSkip: 10000,
      orderby: undefined,
    };
    this.defaultConfiguration(prefix);

    this.hooks = new Hooks();

    this.hooks.addBefore(async (req, res) => {
      res.$odata = {
        status: 404,
        supportedMimetypes: ['application/json']
      }
    }, 'service-initialization');
    this.hooks.addAfter(writer, 'writer', true);

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
    this._serviceDocument = new ServiceDocument(this);
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

  entity(name, handler, metadata, settings, mapping) {
    if (this.resources[name]) {
      throw new Error(`Entity with name "${name}" already defined`);
    }

    this.resources[name] = new Entity(name, handler, metadata, {
      maxSkip: this._settings.maxSkip,
      maxTop: this._settings.maxTop,
      orderby: this._settings.orderby,
      ...settings
    }, mapping);

    return this.resources[name];
  }

  mongoEntity(name, model, handler, metadata, settings, mapping) {
    if (model === undefined) {
      return this.resources[name];
    }

    const entity = new MongoEntity(name, model);

    //this.resources[name].setModel(db.register(name, model));
    const complexTypes = entity.getComplexTypes();

    if (complexTypes) {
      Object.keys(complexTypes)
        .forEach(typeName => {
          const type = complexTypes[typeName];

          this.complexType(typeName, type);
        });
    }

    return this.entity(name, {
      ...entity.getHandler(),
      ...handler
    }, {
      ...entity.getMetadata(),
      ...metadata
    }, settings, {
      ...entity.getMapping(),
      ...mapping
    });
  }
  
  defaultConfiguration(prefix = '') {
    this.set('app', this._app);
    this.set('prefix', prefix);
  }

  action(name, fn, options) {
    this.actions[name] = new Action(name, fn, options);

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

    return [...this.hooks.before, ...result, ...this.hooks.after, error];
  }

  complexType(name, properties) {
    this.resources.$metadata.complexType(name, properties);
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
