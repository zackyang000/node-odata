var odata = require('../../index'),
    mongoose = odata.mongoose,
    fixtures = require('pow-mongoose-fixtures'),
    callback,
    done;

odata.set('db', 'mongodb://localhost/odata-test');

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

odata.resources.register({
  url: '/orders',
  model: orderInfo
});

odata.listen(3000, function(){
  console.log('OData services has started, you can visit by http://localhost:3000/odata/orders');
});
