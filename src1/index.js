import express from 'express';
import Server from './server';
import Resource from './ODataResource';
import Func from './ODataFunction';

const server = function server(db, prefix, options) {
  return new Server(db, prefix, options);
};

server.Resource = function createResouce(name, model) {
  return new Resource(name, model);
};

server.Function = function createFunction() {
  return new Func();
};

server._express = express;

export default server;
