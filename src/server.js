import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import config from './config';
import resources from './resources';
import functions from './functions';
import metadata from './metadata';
import { get as getRepository } from './model';

var server = {};

server.init = function(db, prefix) {
  this._app = express();
  this._app.use(express.bodyParser());
  this._app.use(express.query());
  this._app.use(express.methodOverride());
  this._app.use(cors());
  this._app.disable('x-powered-by');

  this.settings = {};
  this.defaultConfiguration(db, prefix);

  this._mongoose = mongoose;
};

server.defaultConfiguration = function(db, prefix = '/oData' ) {
  this.set('app', this._app);
  this.set('db', db);
  this.set('prefix', prefix);
}

server.resources = resources;

// expose functions
server.functions = functions;
['get', 'put', 'del', 'post'].map((method) => {
  server[method] = (url, handle, auth) => {
    functions.register({
      url: url,
      method: method,
      handle: handle,
      auth: auth,
    });
  }
});

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
  this.settings[key] = val;
  switch (key) {
    case 'db':
      mongoose.connect(val);
      break;
  }
  return this;
};

// expose privite object for special situation.
export default server;
