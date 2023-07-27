const odata = require('../');

const server = odata();

// database
const connection = require('./db');

server.addBefore((req, res, next) => {
  req.$odata = {
    mongo: connection
  };
  next();
});

// entities
const comlexResource = require('./models/complex-resource');
server.mongoEntity('complex-resource', comlexResource);

const user = require('./models/user');
server.mongoEntity('user', user);

const bookModel = require('./models/book');
const _50off = require('./actions/50off');
const bookEntity = server.mongoEntity('book', bookModel);
bookEntity.action('50off', _50off, {
  binding: 'entity'
});

// add some test data
const data = require('../test/support/books.json');
bookModel.deleteMany({}, function(err, result) {
  data.forEach(function(item) {
    entity = new bookModel(item);
    entity.save();
  });
});

// unbind functions
const serverTime = require('./functions/server-time');
server.function('server-time', serverTime);

const license = require('./functions/license');
server.function('license', license);

// server start
server.listen(3000, function(){
  console.log('OData services has started, you can visit by http://localhost:3000/');
});