var odata = require('../../');

var server = odata('mongodb://localhost/odata-test');

// init resources
server.use(requiere('./resources/book'));
server.use(requiere('./resources/user'));

// init functions
server.use(requiere('./functions/license'));
server.use(requiere('./functions/server-time'));

server.listen(3000, function(){
  console.log('OData services has started, you can visit by http://localhost:3000');
});

