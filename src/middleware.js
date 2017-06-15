const debug = require('debug')('node-odata:middleware');
const createRouter = require('koa-router');
const createConnection = require('./mongo/createConnection');
const createModel = require('./mongo/createModel');

module.exports = function createOdataResourceMiddleware(Resource, opts) {
  const { conn } = opts;
  const resource = new Resource;

  // init model after Resource is instantiated.
  const db = createConnection(conn);
  resource.model = createModel(db, resource.name, resource.schema);

  debug(`create koa-router for resource: %s`, resource.name);
  const router = createRouter();
  debug(`GET /%s`, resource.name);
  router.get('/' + resource.name, async function (ctx, next) {
    ctx.body = await resource.list({}, {});
  });
  return router;
}
