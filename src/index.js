"use strict"

/**
 * Module dependencies.
 */
import express from 'express';
import mongoose from 'mongoose';
import config from './config';
import resources from './resources';
import functions from './functions';
import metadata from './metadata';

var createService = (db, prefix) => {
  var app = express();
  initExpress(app);
  var server = {};
  initServer(app, server);

  config.set('app', app);
  config.set('db', db);
  config.set('prefix', prefix);

  return server;
}

var initExpress = (app) => {
  app.use(express.bodyParser());
  app.use(express.query());
  app.use(express.methodOverride());

  app.use((req, res, next) => {
    res.removeHeader("X-Powered-By");
    next();
  });
}

var initServer = (app, server) => {
  server.listen = (...args) => {
    metadata.build();
    app.listen.apply(app, args);
  }

  server.use = (...args) => {
    app.use.apply(app, args);
  }

  server.config = {
    get : config.get,
    set : config.set,
  };

  // resources
  server.resources = resources;

  // functions
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

  server._app = app;
  server.mongoose = mongoose;
}

/**
 * Expose `createService()`.
 */
module.exports = createService;

/**
 * Expose `express` and `mongoose` for special situation.
 */
module.exports.express = express;
module.exports.mongoose = mongoose;
