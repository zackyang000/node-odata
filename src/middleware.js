const debug = require('debug')('node-odata:router');
const createRouter = require('koa-router');
const createConnection = require('./mongo/createConnection');
const createModel = require('./mongo/createModel');

module.exports = function createOdataRouter(Resource, opts) {
  const { conn, queryLimit = {} } = opts;
  const resource = new Resource;

  // init model after Resource is instantiated.
  const db = createConnection(conn);
  resource.model = createModel(db, resource.name, resource.schema);

  debug(`create koa-router for resource: %s`, resource.name);
  const router = createRouter();

  async function queryList(ctx) {
    await runHook(resource.willQueryList, [ctx.request.query]);
    const data = await resource.queryList(ctx.request.query, queryLimit);
    await runHook(resource.didQueryList, [data.entity]);
    return data.entity;
  }

  async function query(ctx) {
  }

  async function create(ctx) {
  }

  async function update(ctx) {
  }

  async function remove(ctx) {
  }

  async function updatePartial(ctx) {
  }


  [queryList].map((func) => {
    router.get(`/${resource.name}`, async function (ctx, next) {
      debug('request %s %s with querystring %o', ctx.request.method, ctx.request.url, ctx.request.query);
      try {
        ctx.body = await func(ctx);
      } catch (e) {
        ctx.body = { error: e.message || e.toString() };
        ctx.status = e.status || 500;
        debug('request %s %s error: %s', ctx.request.method, ctx.request.url, ctx.body);
      }
    });
  });

  [
    { get: query },
    { post: create },
    { put: update },
    { delete: remove },
    { patch: updatePartial },
  ].map((obj) => {
    const [ method, func ] = getFirstEntry(obj);
    router[method](`/${resource.name}\\(:id\\)`, async function (ctx, next) {
      debug('request %s %s with querystring %o', ctx.request.method, ctx.request.url, ctx.request.query);
      try {
        ctx.body = await func(ctx);
      } catch (e) {
        ctx.body = { error: e.message || e.toString() };
        ctx.status = e.status || 500;
        debug('request %s %s error: %s', ctx.request.method, ctx.request.url, ctx.body);
      }
    });
  });


  return router;
}

async function runHook(func, args) {
  const err = await func.apply(this, args);
  if (err) throw err;
}

function getFirstEntry(obj) {
  const key = Object.keys(obj)[0];
  const value = obj[key];
  return [ key, value ];
}
