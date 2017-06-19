const debug = require('debug')('node-odata:router');
const createRouter = require('koa-router');
const createConnection = require('./mongo/createConnection');
const createModel = require('./mongo/createModel');

module.exports = function createOdataRouter(Resource, opts) {
  const { conn } = opts;
  const resource = new Resource;

  // init model after Resource is instantiated.
  const db = createConnection(conn);
  resource.model = createModel(db, resource.name, resource.schema);

  debug(`create koa-router for resource: %s`, resource.name);
  const router = createRouter();

  debug(`create GET /%s`, resource.name);
  router.get('/' + resource.name, async function (ctx, next) {
    debug(`request GET %s with querystring %o`, ctx.request.url, ctx.request.query);
    try {
      await runHook(resource.willQueryList, [ctx.request.query]);
      const data = await resource.queryList(ctx.request.query, {});
      await runHook(resource.didQueryList, [data.entity]);
      ctx.body = data.entity;
    } catch (e) {
      ctx.body = { error: e.message || e.toString() };
      ctx.status = e.status || 500;
    }
  });

  return router;
}

async function runHook(func, args) {
  const err = await func.apply(this, args);
  if (err) throw err;
}
