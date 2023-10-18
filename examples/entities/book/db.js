const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const data = {
  author: String,
  description: String,
  genre: String,
  price: Number,
  publish_date: Date,
  title: String
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

module.exports = mongoose.model('Books', ModelSchema);