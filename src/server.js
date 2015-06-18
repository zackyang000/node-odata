import express from 'express';
import bodyParser from 'body-parser'
import methodOverride from 'method-override'
import mongoose from 'mongoose';
import cors from 'cors';
import { min } from 'lodash'
import parser from './metadata/parser';
import model from './model'
import rest from './rest'
import { get as getRepository } from './model';

var server = {};

server.init = function(db, prefix) {
  this._app = express();
  this._app.use(bodyParser());
  this._app.use(methodOverride());
  this._app.use(express.query());
  this._app.use(cors());
  this._app.disable('x-powered-by');

  this.settings = {};
  this.defaultConfiguration(db, prefix);

  this._mongoose = mongoose;

  // metadata
  this._app.get(this.settings['prefix'] || '/', (req, res, next) => {
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
}

server.resources = [];
server.resources.register = (params) => {
  server.resources.push(params);

  // remove '/' if url is startwith it.
  if (params.url.indexOf('/') === 0) {
    params.url = params.url.substr(1);
  }

  // not allow contain '/' in url.
  if (params.url.indexOf('/') >= 0) {
    throw new Error('Resource of url can\'t contain "/", it can only be allowed to exist in the beginning.');
  }

  model.register(params.url, params.model);

  params.options.maxTop = min(this.get('maxTop'), params.options.maxTop);
  params.options.maxSkip = min(this.get('maxSkip'), params.options.maxSkip);

  router = rest.getRouter(params, this.get('enableOdataSyntax'));
  this._app.use(this.get('prefix'), router);
}

// expose functions
server.functions = {};
server.functions.register = function({ method, url, handle }) {
  method = method.toLowerCase();
  const prefix = this.get('prefix');
  this._app[method](`${prefix}${url}`, handle);
}
// ['get', 'put', 'del', 'post'].map((method) => {
//   server[method] = (url, handle, auth) => {
//     functions.register({
//       url: url,
//       method: method,
//       handle: handle,
//       auth: auth,
//     });
//   }
// });

server.repository = getRepository;

server.listen = function (...args) {
  this._app.listen.apply(this._app, args);
}

server.use = function(...args) {
  this._app.use.apply(this._app, args);
}

server.get = function(key) {
  return this.settings[key];
};

server.set = function(key, val) {
  switch (key) {
    case 'db':
      mongoose.connect(val);
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

// expose privite object for special situation.
export default server;
