var odata = require('../../');

server = odata('mongodb://localhost/odata-test');

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
};

server.resource('orders', order);

server.listen(3000, function(){
  console.log('OData services has started, you can visit by http://localhost:3000/orders');
});
