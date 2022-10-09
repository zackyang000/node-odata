import express from 'express';
import Server from './server';

const server = function server(db, prefix, options) {
  return new Server(db, prefix, options);
};

server._express = express;

export default server;
