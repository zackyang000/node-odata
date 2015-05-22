"use strict";

import config from './../config';
import parser from './parser';

var entities = {}

var register = (params) => {
  var name = params.url;
  var model = params.model;
  entities[name] = model;
}

var build = (entity) => {
  var app = config.get('app');
  var prefix = config.get('prefix');

  app.get(prefix || '/', (req, res, next) => {
    var resources = {};
    Object.keys(entities).map((name) => {
      resources[name] = `http://${req.headers.host}${prefix}/__metadata/${name}`;
    });
    res.json({resources: resources});
  });

  Object.keys(entities).map((name) => {
    app.get("#{prefix}/__metadata/#{name}", (req, res, next) => {
      var metadata = parser.toMetadata(entities[name]);
      res.json({[name]: metadata});
    });
  });
}

module.exports = {
  register: register,
  build: build,
}
