var odata = require('../../');

server = odata();
server.set('db', 'mongodb://localhost/odata-test');

server.resources.register({
    url: '/books-simple',
    model: {
        title: String,
        price: Number
    }
});

server.listen(3000, function(){
  console.log('OData services has started, you can visit by http://localhost:3000/odata/books-simple');
});

module.exports = server;
