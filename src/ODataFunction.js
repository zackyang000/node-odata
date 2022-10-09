import express from 'express';

export default class {
  constructor(name, middleware, params) {
    this._name = name;
    this._middleware = middleware;
    this.params = params || {};
  }

  getName() {
    return this._name;
  }

  _router() {
    const router = express.Router();
    const method = this.params.method || 'get';

    router[method](`/${this._name}`, this._middleware);

    return router;
  }
}
