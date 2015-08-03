"use strict";

import express from 'express';
import Server from './server';
import Resource from './Resource';
import Func from './Function';

const server = function(db, prefix) {
  return new Server(db, prefix);
};

server.Resource = function(name, model) {
  return new Resource(name, model);
};

server.Function = function() {
  return new Func();
};

server._express = express;

export default server;
