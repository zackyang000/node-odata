const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const data = {
  name: String,
  password: {
    type: String,
    select: false
  }
};

const ModelSchema = new Schema(data,
  {
    timestamps: true,
    toObject: {
      virtuals: true,
    },
    toJSON: {
      virtuals: true,
    },
  });

module.exports = mongoose.model('Users', ModelSchema);