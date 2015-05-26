"use strict";

import mongoose from 'mongoose';
import id from './idPlugin';

const register = (name, model) => {
  const conf = {
    _id: false,
    versionKey: false,
    collection: name,
  };
  const schema = new mongoose.Schema(model, conf);
  schema.plugin(id);
  mongoose.model(name, schema);
};

const get = (name) => {
  return mongoose.model(name);
};

module.exports = {
  register: register,
  get: get,
};
