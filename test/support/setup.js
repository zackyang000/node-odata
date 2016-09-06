import mongoose from 'mongoose';
import id from '../../lib/model/idPlugin';

export odata from '../../';
export const host = 'http://localhost:3000';
export const port = '3000';
export const conn = 'mongodb://localhost/odata-test';

export const bookSchema = {
  author: String,
  description: String,
  genre: String,
  price: Number,
  publish_date: Date,
  title: String
};

export const books = require('./books.json');

export function initData() {
  return new Promise((resolve, reject) => {
    const conf = {
      _id: false,
      versionKey: false,
      collection: 'book',
    };

    const db = mongoose.createConnection(conn);
    const schema = new mongoose.Schema(bookSchema, conf);
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

    const promises = books.map(insert);
    clear().then(() => Promise.all(promises).then(resolve));
  });
}
