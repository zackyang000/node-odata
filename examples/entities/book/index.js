const bookModel = require('./db');
const server = require('../../server');
const _50off = require('./50off');
const bookEntity = server.mongoEntity('book', bookModel);

bookEntity.action('50off', _50off, {
  binding: 'entity'
});