import express from 'express';
import bodyParser from 'body-parser';
import methodOverride from 'method-override';
import mongoose from 'mongoose';
import cors from 'cors';
import { min } from 'lodash';
import parser from './metadata/parser';
import model from './model';
import rest from './rest';
import { get as getRepository } from './model';

var server = {};

server.init = function(db, prefix) {
  this._app = express();
  this._app.use(bodyParser.urlencoded({ extended: true }));
  this._app.use(bodyParser.json());
  this._app.use(methodOverride());
  this._app.use(express.query());
  this._app.use(cors());
  this._app.disable('x-powered-by');
  this._mongoose = mongoose;

  this.settings = {};
  this.defaultConfiguration(db, prefix);

  // metadata
  this._app.get(this.settings.prefix || '/', (req, res, next) => {
    const resources = {};
    server.resources.map(function(item){
      resources[item.url] = parser.toMetadata(item.model);
    });
    res.json({ resources });
  });
};

server.defaultConfiguration = function(db, prefix = '/oData' ) {
  this.set('app', this._app);
  this.set('db', db);
  this.set('prefix', prefix);
};

server.resources = [];
server.register = function(params) {
  server.resources.push(params);

  // remove '/' if url is startwith it.
  if (params.url.indexOf('/') === 0) {
    params.url = params.url.substr(1);
  }

  // not allow contain '/' in url.
  if (params.url.indexOf('/') >= 0) {
    throw new Error('Resource of url can\'t contain "/", it can only be allowed to exist in the beginning.');
  }

  model.register(this._db, params.url, params.model);

  params.options = params.options || {};
  params.options.maxTop = min([this.get('maxTop'), params.options.maxTop]);
  params.options.maxSkip = min([this.get('maxSkip'), params.options.maxSkip]);

  let router = rest.getRouter(this._db, params, this.get('enableOdataSyntax'));
  this._app.use(this.get('prefix'), router);
};

// expose functions method
['get', 'put', 'del', 'post'].map((method) => {
  server[method] = (url, handle, auth) => {
    const app = this.get('app');
    const prefix = this.get('prefix');
    app[method](`${prefix}${url}`, function(req, res, next) {
      if (checkAuth(route.config.auth, req)) {
        handle(req, res, next);
      }
      else {
        res.status(401).end();
      }
    });
  };
});

server.repository = function(name) {
  return getRepository(this._db, name);
};

server.listen = function (...args) {
  this._app.listen.apply(this._app, args);
};

server.use = function(...args) {
  this._app.use.apply(this._app, args);
};

server.get = function(key, handle, auth) {
  if (handle === undefined) {
    return this.settings[key];
  }
  // TODO: Need to refactor, same as L70-L80
  const app = this.get('app');
  const prefix = this.get('prefix');
  app.get(`${prefix}${key}`, function(req, res, next) {
    if (checkAuth(auth, req)) {
      handle(req, res, next);
    }
    else {
      res.status(401).end();
    }
  });
};

server.set = function(key, val) {
  switch (key) {
    case 'db':
      this._db = mongoose.createConnection(val);
    break;
    case 'prefix':
      if (val === '/') {
      val = '';
    }
    break;
  }
  this.settings[key] = val;
  return this;
};


const checkAuth = (auth, req) => {
  if (!auth) {
    return true;
  }
  return auth(req);
};

// expose privite object for special situation.
export default server;
