var odata = require('../../');

server = odata();
server.set('db', 'mongodb://localhost/odata-test');

var order = {
  custom: {
    id: String,
    name: String
  },
  orderItems: [{
    quantity: Number,
    product: {
      id: String,
      name: String,
      price: Number
    }
  }]
}

server.resources.register({
  url: '/orders',
  model: orderInfo
});

server.listen(3000, function(){
  console.log('OData services has started, you can visit by http://localhost:3000/odata/orders');
});

module.exports = server;
