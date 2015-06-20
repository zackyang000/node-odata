"use strict";

import mongoose from 'mongoose';
import id from './idPlugin';

const register = function(_conn, name, model) {
  const conf = {
    _id: false,
    versionKey: false,
    collection: name,
  };
  const schema = new mongoose.Schema(model, conf);
  schema.plugin(id);
  _conn.model(name, schema);
};

const get = (_conn, name) => {
  return _conn.model(name);
};

export default { register, get };
