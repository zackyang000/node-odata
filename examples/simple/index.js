var odata = require('../../index');

odata.set('db', 'mongodb://localhost/odata-test');

odata.resources.register({
    url: '/books-simple',
    model: {
        title: String,
        price: Number
    }
});

odata.listen(3000, function(){
  console.log('OData services has started, you can visit by http://localhost:3000/odata/books-simple');
});
