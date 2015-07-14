var odata = require('../../');

var book = require('./resources/book');
var user = require('./resources/user');
var license = require('./functions/license');
var serverTime = require('./functions/server-time');

var server = odata('mongodb://localhost/odata-test');

server.use(book);
server.use(user);
server.use(license);
server.use(serverTime);

server.listen(3000, function(){
  console.log('OData services has started, you can visit by http://localhost:3000');
});

module.exports = exports = server;

