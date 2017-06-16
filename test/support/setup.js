const mongoose = require('mongoose');
const id = require('../../src/mongo/utils/idPlugin');

const odata = require('../../');
exports.host = 'http://localhost:3000';
exports.port = '3000';
exports.conn = 'mongodb://localhost/odata-test';

exports.bookSchema = {
  author: String,
  description: String,
  genre: String,
  price: Number,
  publish_date: Date,
  title: String
};

exports.books = require('./books.json');

exports.initData = function initData() {
  return new Promise((resolve, reject) => {
    const conf = {
      _id: false,
      versionKey: false,
      collection: 'book',
    };

    const db = mongoose.createConnection(exports.conn);
    const schema = new mongoose.Schema(exports.bookSchema, conf);
    schema.plugin(id);
    const model = db.model('book', schema);

    function clear() {
      return new Promise((resolve) => {
        model.remove({}, resolve);
      });
    }

    function insert(item) {
      return new Promise((resolve) => {
        const entity = new model(item);
        entity.save((err, result) => resolve(result));
      });
    }

    const promises = exports.books.map(insert);
    clear().then(() => Promise.all(promises).then(resolve));
  });
}
