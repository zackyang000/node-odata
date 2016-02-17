import express from 'express';
import Server from './server';
import Resource from './resource';
import Func from './function';

const server = function server(db, prefix) {
  return new Server(db, prefix);
};

server.Resource = function createResouce(name, model) {
  return new Resource(name, model);
};

server.Function = function createFunction() {
  return new Func();
};

server._express = express;

export default server;
