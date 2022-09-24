import createExpress from './express';
import Resource from './ODataResource';
import Func from './ODataFunction';
import Metadata from './metadata/ODataMetadata';
import Db from './db/db';

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

    // TODO: Infact, resources is a mongooseModel instance, origin name is repositories.
    // Should mix _resources object and resources object: _resources + resource = resources.
    // Encapsulation to a object, separate mognoose, try to use *repository pattern*.
    // 这里也许应该让 resources 支持 odata 查询的, 以方便直接在代码中使用 OData 查询方式来进行数据筛选, 达到隔离 mongo 的效果.
    this.resources = {};
    this._metadata = new Metadata(this);
  }

  function(url, middleware) {
    const func = new Func();
    const router = func.router();

    router.get(url, middleware);
    this.use(router);
  }

  resource(name, model) {
    if (model === undefined) {
      return this.resources[name];
    }

    const db = this.get('db');
    this.resources[name] = new Resource(this, name, model);

    this.resources[name].setModel(db.register(name, model));

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

  listen(...args) {
    const router = this._metadata._router();

    this._app.use(this.get('prefix'), router);

    Object.keys(this.resources).forEach((resourceKey) => {
      const resource = this.resources[resourceKey];
      const resourceRouter = resource._router(this.getSettings());

      this.use(this.get('prefix'), resourceRouter);

      if (resource.actions) {
        Object.keys(resource.actions).forEach((actionKey) => {
          const action = resource.actions[actionKey];

          this.use(action.router);
        });
      }
    });

    return this._app.listen(...args);
  }

  getSettings() {
    return this._settings;
  }

  use(...args) {
    if (args[0] instanceof Resource) {
      this.resources[args[0].getName()] = args[0];
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
