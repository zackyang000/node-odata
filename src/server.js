import createExpress from './express';
import ODataResource from './ODataResource';
import Entity from './odata/Entity';
import Func from './ODataFunction';
import Metadata from './odata/Metadata';
import ServiceDocument from './odata/ServiceDocument';
import Batch from './odata/Batch';
import Db from './db/db';
import Action from './odata/Action';
import error from './middlewares/error';
import writer from './middlewares/writer';
import Hooks from './odata/Hooks';

function checkAuth(auth, req) {
  return !auth || auth(req);
}

class Server {
  constructor(db, prefix, options) {
    this._app = createExpress(options);
    this._settings = {
      maxTop: 10000,
      maxSkip: 10000,
      orderby: undefined,
    };
    this.defaultConfiguration(db, prefix);

    this.hooks = new Hooks();
    const dbValue = this.get('db');

    this.hooks.addBefore(async (req, res) => {
      req.$odata = {
        mongo : dbValue._models
      };
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

  function(url, middleware, params) {
    const func = new Func(url.replace(/[ /]+/, ''), middleware, params);

    this.resources[func.getName()] = func;
  }

  resource(name, model) {
    if (model === undefined) {
      return this.resources[name];
    }

    const db = this.get('db');
    this.resources[name] = new ODataResource(this, name, model);

    this.resources[name].setModel(db.register(name, model));

    return this.resources[name];
  }

  entity(name, handler, metadata) {
    if (this.resources[name]) {
      throw new Error(`Entity with name "${name}" already defined`);
    }

    this.resources[name] = new Entity(name, handler, metadata);

    return this.resources[name];
  }

  defaultConfiguration(db, prefix = '') {
    this.set('app', this._app);
    this.set('db', db);
    this.set('prefix', prefix);
  }

  post(url, callback, auth) {
    const app = this.get('app');
    const prefix = this.get('prefix');
    app.post(`${prefix}${url}`, (req, res, next) => {
      if (checkAuth(auth, req)) {
        callback(req, res, next);
      } else {
        res.status(401).end();
      }
    });
  }

  put(url, callback, auth) {
    const app = this.get('app');
    const prefix = this.get('prefix');
    app.put(`${prefix}${url}`, (req, res, next) => {
      if (checkAuth(auth, req)) {
        callback(req, res, next);
      } else {
        res.status(401).end();
      }
    });
  }

  delete(url, callback, auth) {
    const app = this.get('app');
    const prefix = this.get('prefix');
    app.delete(`${prefix}${url}`, (req, res, next) => {
      if (checkAuth(auth, req)) {
        callback(req, res, next);
      } else {
        res.status(401).end();
      }
    });
  }

  patch(url, callback, auth) {
    const app = this.get('app');
    const prefix = this.get('prefix');
    app.patch(`${prefix}${url}`, (req, res, next) => {
      if (checkAuth(auth, req)) {
        callback(req, res, next);
      } else {
        res.status(401).end();
      }
    });
  }

  action(name, fn, options) {
    this.actions[name] = new Action(name, fn, options);

    return this.actions[name];
  }

  _getRouter() {
    const result = [];

    result.push(this._serviceDocument._router());

    Object.keys(this.resources).forEach((resourceKey) => {
      const resource = this.resources[resourceKey];

      result.push(resource._router ? resource._router(this.getSettings()) : resource.getRouter());

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
    const router = this._getRouter();

    router.forEach((item) => {
      this._app.use(this.get('prefix'), item);
    });

    return this._app.listen(...args);
  }

  getSettings() {
    return this._settings;
  }

  use(...args) {
    if (args[0] instanceof ODataResource) {
      const [resource] = args;
      this.resources[resource.getName()] = resource;
      return;
    }
    this._app.use(...args);
  }

  get(key, callback, auth) {
    if (callback === undefined) {
      return this._settings[key];
    }
    // TODO: Need to refactor, same as L70-L80
    const app = this.get('app');
    const prefix = this.get('prefix');
    return app.get(`${prefix}${key}`, (req, res, next) => {
      if (checkAuth(auth, req)) {
        callback(req, res, next);
      } else {
        res.status(401).end();
      }
    });
  }

  set(key, val) {
    switch (key) {
      case 'db': {
        let db = val;

        if (typeof val === 'string') {
          db = new Db();
          db.createConnection(val, null, (err) => {
            if (err) {
              console.error(err.message);
              console.error('Failed to connect to database on startup.');
              process.exit();
            }
          });
        }

        this._settings[key] = db;
        break;
      }
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

  // provide a event listener to handle not able to connect DB.
  on(name, event) {
    if (['connected', 'disconnected'].indexOf(name) > -1) {
      const db = this.get('db');

      db.on(name, event);
    }
  }

  engine(...args) {
    this._app.engine(...args);
  }
}

export default Server;
