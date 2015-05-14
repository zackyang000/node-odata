"use strict"

/**
 * Module dependencies.
 */
var express = require('express');
var mongoose = require('mongoose');
var config = require('./config');
var resources = require('./resources');
var functions = require('./functions');
var metadata = require('./metadata');


var createService = (db, prefix) => {
  var app = express();
  app.use(express.bodyParser());
  app.use(express.query());
  app.use(express.methodOverride());

  app.use((req, res, next) => {
    res.removeHeader("X-Powered-By");
    next();
  });

  config.set('app', app)
  if(db)
    config.set('db', db)
  if(prefix)
    config.set('db', prefix)  
  
  var server = {}

  server.listen = () => {
    metadata.build()
    app.listen.apply(app, arguments)
  }

  server.use = () => {
    app.use.apply(app, arguments)
  }

  server.config = {
    get : config.get,
    set : config.set,
  };

  server.resources = resources;

  server._app = app;

  server.mongoose = mongoose;

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

  return server;
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
