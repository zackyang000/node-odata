const debug = require('debug')('node-odata:router');
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
  debug(`create GET /%s`, resource.name);
  router.get('/' + resource.name, async function (ctx, next) {
    debug(`request GET %s %o`, ctx.request.url, ctx.request.query);
    ctx.body = await resource.list(ctx.request.query, {});
  });
  return router;
}
