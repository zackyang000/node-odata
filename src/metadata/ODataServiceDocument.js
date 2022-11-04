import { Router } from 'express';
import pipes from '../pipes';
import Resource from '../ODataResource';

export default class Metadata {
  constructor(server) {
    this._server = server;
    this._hooks = {
    };
    this._count = 0;
  }

  get() {
    return this;
  }

  before(fn) {
    this._hooks.before = fn;
    return this;
  }

  after(fn) {
    this._hooks.after = fn;
    return this;
  }

  auth(fn) {
    this._hooks.auth = fn;
    return this;
  }

  _router() {
    /*eslint-disable */
    const router = Router();
    /* eslint-enable */
    router.get('/', (req, res) => {
      pipes.authorizePipe(req, res, this._hooks.auth)
        .then(() => pipes.beforePipe(req, res, this._hooks.before))
        .then(() => this.ctrl(req))
        .then((result) => pipes.respondPipe(req, res, result || {}))
        .then((data) => pipes.afterPipe(req, res, this._hooks.after, data))
        .catch((err) => pipes.errorPipe(req, res, err));
    });

    return router;
  }

  ctrl(req) {
    const entityTypeNames = Object.keys(this._server.resources);
    const entitySets = entityTypeNames
      .filter((item) => this._server.resources[item] instanceof Resource)
      .map((currentResource) => ({
        name: currentResource,
        kind: 'EntitySet',
        url: currentResource,
      }));

    const document = {
      '@context': `${req.protocol}://${req.get('host')}${this._server.get('prefix')}/$metadata`,
      value: entitySets,
    };

    return new Promise((resolve) => {
      resolve({
        status: 200,
        serviceDocument: document,
      });
    });
  }
}
