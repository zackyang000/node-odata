var odata = require('../../');

server = odata();
server.set('db', 'mongodb://localhost/odata-test');

var bookInfo = {
  author: String,
  description: String,
  genre: String,
  price: Number,
  publish_date: Date,
  title: String
}

server.resources.register({
  url: '/books',
  model: bookInfo,
  actions: {
    '/50off': function(req, res, next){
      var mongoose = server.mongoose;
      mongoose.model('books').findById(req.params.id, function(err, book){
        book.price = +(book.price / 2).toFixed(2);
        book.save(function(err){
          res.jsonp(book);
        });
      });
    }
  }
});

server.functions.register({
    url: '/license',
    method: 'GET',
    handle: function(req, res, next){
      res.jsonp({license:'MIT'});
    }
})

server.listen(3000, function(){
  console.log('OData services has started, you can visit by http://localhost:3000/odata/books');
});

module.exports = server;
