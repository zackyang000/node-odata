const Koa = require('koa');

class oData extends Koa {
  static get Resource() {
    return class Resource {
    };
  };

  constructor() {
    super();
  }
};

module.exports = oData;


