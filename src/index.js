"use strict";

import Server from './server';
import Resource from './resource';
import func from './function';

const server = function(db, prefix) {
  return new Server(db, prefix);
};

server.Resource = function(name, model) {
  return new Resource(name, model);
};

server.Function = function() {
  return new func();
};

export default server;
