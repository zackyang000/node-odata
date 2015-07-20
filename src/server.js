"use strict";

import express from 'express';
import bodyParser from 'body-parser';
import methodOverride from 'method-override';
import mongoose from 'mongoose';
import cors from 'cors';
import { min } from 'lodash';
import parser from './metadata/parser';
import model from './model';
import rest from './rest';
import Resource from './resource';
import { get as getRepository } from './model';

class Server {
  constructor(db, prefix) {
    this._app = express();
    this._app.use(bodyParser.urlencoded({ extended: true }));
    this._app.use(bodyParser.json());
    this._app.use(methodOverride());
    this._app.use(express.query());
    this._app.use(cors());
    this._app.disable('x-powered-by');
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

  defaultConfiguration(db, prefix = '' ) {
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

  // expose functions method
  post(url, callback, auth) {
    const app = this.get('app');
    const prefix = this.get('prefix');
    app.post(`${prefix}${url}`, function(req, res, next) {
      if (checkAuth(auth, req)) {
        callback(req, res, next);
      }
      else {
        res.status(401).end();
      }
    });
  }

  put(url, callback, auth) {
    const app = this.get('app');
    const prefix = this.get('prefix');
    app.put(`${prefix}${url}`, function(req, res, next) {
      if (checkAuth(auth, req)) {
        callback(req, res, next);
      }
      else {
        res.status(401).end();
      }
    });
  }

  delete(url, callback, auth) {
    const app = this.get('app');
    const prefix = this.get('prefix');
    app.delete(`${prefix}${url}`, function(req, res, next) {
      if (checkAuth(auth, req)) {
        callback(req, res, next);
      }
      else {
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
    if (args.length === 1 && args[0] instanceof Resource) {
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
    app.get(`${prefix}${key}`, function(req, res, next) {
      if (checkAuth(auth, req)) {
        callback(req, res, next);
      }
      else {
        res.status(401).end();
      }
    });
  }

  set(key, val) {
    switch (key) {
      case 'db':
        this._db = mongoose.createConnection(val);
        break;
      case 'prefix':
        if (val === '/') {
          val = '';
        }
        if ( val.length > 0 && val[0] !== '/') {
          val = '/' + val;
        }
        break;
    }
    this._settings[key] = val;
    return this;
  }
}

function checkAuth (auth, req) {
  if (!auth) {
    return true;
  }
  return auth(req);
}

// expose privite object for special situation.
export default Server;
