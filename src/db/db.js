import mongoose from 'mongoose';
import Model from './model';
import id from './idPlugin';

mongoose.Promise = global.Promise;

export default class {
  constructor() {
    this._models = {};
  }

  createConnection(connection, options, onError) {
    this._connection = mongoose.createConnection(connection, options, onError);

    return this._connection;
  }

  on(name, event) {
    this._connection.on(name, event);
  }

  register(name, model) {
    const conf = {
      _id: false,
      versionKey: false,
      collection: name,
    };
    const schema = new mongoose.Schema(model, conf);
    schema.plugin(id);
    const mongooseModel = this._connection.model(name, schema);
    this._models[name] = new Model(mongooseModel);
    return this._models[name];
  }
}
