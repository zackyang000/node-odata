"use strict";

import proto from './server';

const createService = (db, prefix) => {
  const server = {};
  server.__proto__ = proto;
  server.init(db, prefix);
  return server;
}

export default createService;
