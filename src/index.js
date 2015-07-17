"use strict";

import Server from './server';
import Resource from './resource';
import Func from './function';

const server = function(db, prefix) {
  return new Server(db, prefix);
};

server.Resource = function(name, model) {
  return new Resource(name, model);
};

server.Function = function() {
  return new Func();
};

export default server;
