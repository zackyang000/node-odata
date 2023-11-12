const server = require('../../server');
const user = require('./db');

server.mongoEntity('user', user);