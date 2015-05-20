import mongoose from 'mongoose';
import id from './idPlugin';

var register = function(name, model) {
  var conf = {
    _id: false,
    versionKey: false,
    collection: name,
  };
  var schema = new mongoose.Schema(model, conf);
  schema.plugin(id);
  mongoose.model(name, schema);
};

var get = function(name) {
  return mongoose.model(name);
};

module.exports = {
  register: register,
  get: get,
};
