const Koa = require('koa');

const CLASS_RESOURCE_SYMBOL = Symbol('_CLASS_RESOURCE_');

class Resource {
  static get _CLASS_RESOURCE_() {
    return CLASS_RESOURCE_SYMBOL;
  }
}

class oData extends Koa {
  static get Resource() {
    return Resource;
  };

  constructor() {
    super();
  }

  use(...args) {
    const arg = args[0];
    if (arg instanceof Array) {
      arg.filter((item) => item._CLASS_RESOURCE_ === Resource._CLASS_RESOURCE_).map(this.use);
      return;
    }
    console.log(args[0]._CLASS_RESOURCE_ === Resource._CLASS_RESOURCE_)

    // return super.use(...args);
  }
};

module.exports = oData;


