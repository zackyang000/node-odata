const mongoose = require('mongoose');
const id = require('./utils/idPlugin');

const createModel = (db, name, model) => {
  const conf = {
    _id: false,
    versionKey: false,
    collection: name,
  };
  const schema = new mongoose.Schema(model, conf);
  schema.plugin(id);
  return db.model(name, schema);
};

module.exports = createModel;
