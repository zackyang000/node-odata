import createExpress from './express';
import mongoose from 'mongoose';
import Resource from './ODataResource';

function checkAuth(auth, req) {
  return !auth || auth(req);
}

class Server {
  constructor(db, prefix) {
    this._app = createExpress();
    this._mongoose = mongoose;
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
    this._resources = [];
    this.resources = {};

    // metadata
    // this._app.get(this.settings.prefix || '/', (req, res, next) => {
    //   const resources = {};
    //   this.resources.map(function(item){
    //     resources[item.url] = parser.toMetadata(item.model);
    //   });
    //   res.json({ resources });
    // });
  }

  defaultConfiguration(db, prefix = '') {
    this.set('app', this._app);
    this.set('db', db);
    this.set('prefix', prefix);
  }

  resource(name, model) {
    if (model === undefined) {
      return this._resources.name;
    }
    const resource = new Resource(name, model);
    this._resources.push(resource);
    return resource;
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
    this._resources.map((resource) => {
      const router = resource._router(this._db, this._settings);
      this._app.use(this.get('prefix'), router);
      this.resources[resource._name] = this._db.model(resource._name);
    });
    return this._app.listen.apply(this._app, args);
  }

  use(...args) {
    if (args[0] instanceof Resource) {
      this._resources.push(args[0]);
      return;
    }
    this._app.use.apply(this._app, args);
  }

  get(key, callback, auth) {
    if (callback === undefined) {
      return this._settings[key];
    }
    // TODO: Need to refactor, same as L70-L80
    const app = this.get('app');
    const prefix = this.get('prefix');
    app.get(`${prefix}${key}`, (req, res, next) => {
      if (checkAuth(auth, req)) {
        callback(req, res, next);
      } else {
        res.status(401).end();
      }
    });
  }

  set(key, val) {
    // Extra processing
    switch (key) {
      case 'db':
        this._db = mongoose.createConnection(val);
        this._settings[key] = val;
        break;
      case 'prefix':
        let prefix = val;
        if (prefix === '/') {
          prefix = '';
        }
        if (prefix.length > 0 && prefix[0] !== '/') {
          prefix = `/${prefix}`;
        }
        this._settings[key] = prefix;
        break;
      default:
        this._settings[key] = val;
        break;
    }
    return this;
  }
}


export default Server;
