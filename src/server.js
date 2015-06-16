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

  this.defaultConfiguration(db, prefix);

  this._mongoose = mongoose;
};

server.defaultConfiguration = function(db, prefix) {
  config.set('app', this._app);
  config.set('db', db);
  config.set('prefix', prefix);
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

// expose repository
server.repository = getRepository;

// expose listen.
server.listen = function (...args) {
  this._app.listen.apply(this._app, args);
}

//expose use
server.use = function(...args) {
  this._app.use.apply(this._app, args);
}

// expose config
server.config = {
  get : config.get,
  set : config.set,
};

// expose privite object for special situation.
export default server;
