"use strict";

import mongoose from 'mongoose';
import id from './idPlugin';

const register = function(_db, name, model) {
  const conf = {
    _id: false,
    versionKey: false,
    collection: name,
  };
  const schema = new mongoose.Schema(model, conf);
  schema.plugin(id);
  _db.model(name, schema);
};

const get = (_db, name) => {
  return _db.model(name);
};

export default { register, get };
