var express = require('express'),
    odata = require('../../index');
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

// important data for test.
var Book = odata.mongoose.model('Book');
booksList = require('./data.json');
Book.remove(function(){
  for (var i = 0; i < booksList.length; i++){
    var entity = new Book(booksList[i]);
    entity.save()
  }
});

app.listen(3000, function(){
  console.log('OData services has started, you can visit by http://localhost:3000/odata/books');
});