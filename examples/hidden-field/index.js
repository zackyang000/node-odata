var odata = require('../../');

server = odata('mongodb://localhost/odata-test');

server.resources.register({
    url: '/users',
    model: {
        name: String,
        password: {
          type: String,
          select: false
        }
    }
});

server.listen(3000, function(){
  console.log('OData services has started, you can visit by http://localhost:3000/odata/users');
});

module.exports = server;
