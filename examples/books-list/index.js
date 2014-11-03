var express = require('express'),
    odata = require('../../index'),
    mongoose = odata.mongoose,
    fixtures = require('pow-mongoose-fixtures'),
    callback,
    done;
var app = express();

app.use(express.bodyParser());
app.use(express.query());

odata.set('app', app);
odata.set('db', 'mongodb://localhost/test-books-list');

odata.resources.register({
  url: '/books',
  model: {
    Book: {
      author: String,
      description: String,
      genre: String,
      id: String,
      price: Number,
      publish_date: Date,
      title: String
    }
  },
  actions: {
    '/50off': {
      handle: function(req, res, next){
        var Book = mongoose.model("Book");
        Book.findById(req.params.id, function(err, book){
          if(err){
            next(err);
            return;
          }
          book.price = +((book.price/2).toFixed(2));
          book.save(function(err){
            res.jsonp(book);
          })
        });
      }
    }
  }
});

odata.functions.register({
    url: '/license',
    method: 'GET',
    handle: function(req, res, next){
      res.jsonp({license:'MIT'});
    }
})

// import data.
data = require('./data.json');
for(var i = 0; i < data.Book.length; i++){
  data.Book[i]._id = mongoose.Types.ObjectId();
}
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
