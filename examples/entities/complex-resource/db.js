const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const data = {
  custom: {
    id: String,
    name: String
  },
  orderItems: [{
    quantity: Number,
    product: {
      id: String,
      name: String,
      price: Number
    }
  }]
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

module.exports = mongoose.model('ComplexResource', ModelSchema);