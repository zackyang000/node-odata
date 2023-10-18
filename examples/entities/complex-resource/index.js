const server = require('../../server');
const comlexResource = require('./db');

server.mongoEntity('complex-resource', comlexResource);