var odata = require('../../index'),
    mongoose = odata.mongoose,
    fixtures = require('pow-mongoose-fixtures'),
    callback,
    done;

odata.set('db', 'mongodb://localhost/odata-test');

var bookInfo = {
  author: String,
  description: String,
  genre: String,
  id: String,
  price: Number,
  publish_date: Date,
  title: String
}

odata.resources.register({
  url: '/books',
  model: bookInfo,
  actions: {
    '/50off': function(req, res, next){
      mongoose.model('books').findById(req.params.id, function(err, book){
        book.price = +(book.price / 2).toFixed(2);
        book.save(function(err){
          res.jsonp(book);
        });
      });
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

odata.listen(3000, function(){
  console.log('OData services has started, you can visit by http://localhost:3000/odata/books');
});
