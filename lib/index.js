'use strict';

var _arguments = arguments;
/**
 * Module dependencies.
 */

require('express');

require('mongoose');

require('./config');

require('./resources');

require('./functions');

require('./metadata');

var createService = function createService(db, prefix) {
  var app = express();
  initExpress(app);
  var server = {};
  initServer(app, server);

  config.set('app', app);
  config.set('db', db);
  config.set('prefix', prefix);

  return server;
};

var initExpress = function initExpress(app) {
  app.use(express.bodyParser());
  app.use(express.query());
  app.use(express.methodOverride());

  app.use(function (req, res, next) {
    res.removeHeader('X-Powered-By');
    next();
  });
};

var initServer = function initServer(app, server) {
  server.listen = function () {
    metadata.build();
    app.listen.apply(app, _arguments);
  };

  server.use = function () {
    app.use.apply(app, _arguments);
  };

  server.config = {
    get: config.get,
    set: config.set };

  // resources
  server.resources = resources;

  // functions
  server.functions = functions;
  ['get', 'put', 'del', 'post'].map(function (method) {
    server[method] = function (url, handle, auth) {
      functions.register({
        url: url,
        method: method,
        handle: handle,
        auth: auth });
    };
  });

  server._app = app;
  server.mongoose = mongoose;
};

/**
 * Expose `createService()`.
 */
module.exports = createService;

/**
 * Expose `express` and `mongoose` for special situation.
 */
module.exports.express = express;
module.exports.mongoose = mongoose;