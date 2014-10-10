var express = require('express'),
    odata = require('../../index'),
    mongoose = odata.mongoose,
    fixtures = require('pow-mongoose-fixtures'),
    callback,
    done;
var app = express();

odata.set('app', app);
odata.set('db', 'mongodb://localhost/test-books-list');

odata.resources.register({ url: '/books', modelName: 'Book', model: {
  author: String,
  description: String,
  genre: String,
  id: String,
  price: Number,
  publish_date: Date,
  title: String
}});

// import data.
var Book = odata.mongoose.model('Book');
data = require('./data.json');
fixtures.load(data, mongoose.connection, function(err) {
  module.exports.books = data.Book;
  done = true;
  if(callback) callback();
});

// start server
app.listen(3000, function(){
  console.log('OData services has started, you can visit by http://localhost:3000/odata/books');
});

// for mocha-test
module.exports.app = app;
module.exports.ready = function(cb){
  callback = cb;
  if(done) callback();
}
