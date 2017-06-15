const debug = require('debug')('node-odata:core');
const Koa = require('koa');
const Resource = require('./Resource');
const createOdataResourceMiddleware = require('./middleware');

class oData extends Koa {
  static get Resource() {
    return Resource;
  };

  constructor(opts) {
    super();
    debug(`invoke oData constructor with opts: %o`, opts);
    this.opts = opts;
  }

  use(...args) {
    const arg = args[0];

    // handle resources array
    if (arg instanceof Array) {
      arg.filter((item) => item._RESOURCE_ === Resource._RESOURCE_).map((item) => this.use(item));
      return;
    }

    // convert to middleware if declare a Resource Class
    if (arg._RESOURCE_ === Resource._RESOURCE_) {
      const middleware = createOdataResourceMiddleware(arg, this.opts);
      super.use(middleware.routes());
      super.use(middleware.allowedMethods());
      return;
    }

    return super.use(...args);
  }
};

module.exports = oData;

