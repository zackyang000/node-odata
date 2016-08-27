var mongoose = require('mongoose');
var books = require('./books.json');
var id = require('../../lib/model/idPlugin').default;

var bookSchema = {
  author: String,
  description: String,
  genre: String,
  price: Number,
  publish_date: Date,
  title: String,
};

var conf = {
  _id: false,
  versionKey: false,
  collection: 'book',
}

var schema = new mongoose.Schema(bookSchema, conf);
schema.plugin(id);

module.exports = (conn, callback) => {
  var count = 0;
  var done = () => {
    count++;
    if (count === books.length) {
      model.find().exec((err, data) => {
        callback && callback(data);
      });
    }
  }

  var db = mongoose.createConnection(conn);
  var model = db.model('book', schema);

  model.remove({}, (err, result) => {
    books.map((item) => {
      var entity = new model(item);
      entity.save(done);
    });
  });
}
