var odata = require('../../index'),
    mongoose = odata.mongoose,
    fixtures = require('pow-mongoose-fixtures'),
    callback,
    done;

odata.set('db', 'mongodb://localhost/odata-full');

var bookInfo = {
  author: String,
  description: String,
  genre: String,
  id: String,
  price: Number,
  publish_date: Date,
  title: String,
  test: {
    a: String,
    b: {
      b1: String
    }
  },
  test2: [{a: String, b:String, c:{c1: String, c2: [{ d: Number}]}}],
  test3: [{a: [String], b: String}]
}
/*
test data:

{
"author": "zxczxczxc",
"test": {"a":"ccccc"},
"test2": [ {"a":"123", "c":{"c1":123, "c2": [{"d":1},{"d":2},{"d":3}]}} ],
"test3": [{"a":["a","b","c"],"b":"abc"},{"a":["a1","b1","c1"],"b":"abc1"}]
}

*/
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
