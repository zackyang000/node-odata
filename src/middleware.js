const debug = require('debug')('node-odata:middleware');
const createConnection = require('./mongo/createConnection');
const createModel = require('./mongo/createModel');

module.exports = function createOdataResourceMiddleware(Resource, opts) {
  const { conn } = opts;
  const resource = new Resource;
  debug(`convert resource '%s' to middleware version`, resource.name);

  // init model after Resource is instantiated.
  const db = createConnection(conn);
  resource.model = createModel(db, resource.name, resource.schema);

  return function() {
  }
}
