require('./db'); // database connection
require('./entities/complex-resource');
require('./entities/book');
require('./entities/user');
require('./functions/license');
require('./functions/server-time');

const server = require('./server');
const bookModel = require('./entities/book/db');

// add some test data
const data = require('../test/support/books.json');
bookModel.deleteMany({}).then(function() {
  data.forEach(function(item) {
    const parseditem = JSON.parse(JSON.stringify(item));

    delete parseditem.id;
    entity = new bookModel(parseditem);
    entity.save();
  });
});

// server start
server.listen(3000, function(){
  console.log('OData services has started, you can visit by http://localhost:3000/');
});