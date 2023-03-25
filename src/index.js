import express from 'express';
import Server from './server';
import mulpipartMixed from './parser/multipartMixed'

export const odata = function server(db, prefix, options) {
  return new Server(db, prefix, options);
};

odata._express = express;

export default odata;

