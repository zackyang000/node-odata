var odata = require('../../');

var server = odata('mongodb://localhost/odata-test');

var bookInfo = {
  author: String,
  description: String,
  genre: String,
  price: Number,
  publish_date: Date,
  title: String
};

server.resource('book', bookInfo)
  .action('/50off', function(req, res, next){
    server.repository('book').findById(req.params.id, function(err, book){
      book.price = +(book.price / 2).toFixed(2);
      book.save(function(err){
        res.jsonp(book);
      });
    });
  });

server.get('/license', function(req, res, next){
  res.jsonp({license:'MIT'});
});

server.on('connected', function() {
  console.log('MongoDB connected!');
});
server.on('disconnected', function() {
  console.log('MongoDB disconnected!');
});

server.listen(3000, function(){
  console.log('OData services has started, you can visit by http://localhost:3000/book');
});

module.exports = server;
