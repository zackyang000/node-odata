import mongoose from 'mongoose';
import id from './idPlugin';

const register = (_db, name, model) => {
  const conf = {
    _id: false,
    versionKey: false,
    collection: name,
  };
  const schema = new mongoose.Schema(model, conf);
  schema.plugin(id);
  return _db.model(name, schema);
};

export default { register };
