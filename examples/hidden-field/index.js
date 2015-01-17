var odata = require('../../index');

odata.set('db', 'mongodb://localhost/odata-test');

odata.resources.register({
    url: '/users',
    model: {
        name: String,
        password: {
          type: String,
          select: false
        }
    }
});

odata.listen(3000, function(){
  console.log('OData services has started, you can visit by http://localhost:3000/odata/users');
});
