import { Router } from 'express';
import pipes from './pipes';

export default class Action {
  constructor(name, fn, options) {

    this.name = name;
    this.fn = fn;

    if (options) {
      this.auth = options.auth;
      this.binding = options.binding;
      this.resource = options.resource;
      this.server = options.server;
      this.$Parameter = options.$Parameter;
    }
  }

  match(method, url) {
    const regex = this.getPath(true);

    if (method === 'post' && url.match(regex)) {
      return this.fn;
    }
  }

  getRouter() {
    if (!this.router) {
      if (!this.name || !this.name.match(/^^[_a-zA-Z0-9][_a-zA-Z0-9.-]*$/)) {
        throw new Error(`Invalid action name '${this.name}'`);
      }

      const path = this.getPath();

      this.router = this.getOperationRouter(path, this.fn, this.auth);
    }

    return this.router;
  }

  getPath(asRegex) {
    let path;

    switch (this.binding) {
      case 'entity':
        if (!this.resource) {
          throw new Error(`Binding '${this.binding}' require a resource`)
        }
        path = asRegex ? new RegExp(`\/?${this.resource._url}\\('?[A-Fa-f0-9]*'?\\)\/${this.name}$`) : `/${this.resource._url}\\(:id\\)/${this.name}`;
        break;
      case 'collection':
        if (!this.resource) {
          throw new Error(`Binding '${this.binding}' require a resource`)
        }
        path = asRegex ? new RegExp(`\/?${this.resource._url}\/${this.name}$`) : `/${this.resource._url}/${this.name}`;
        break;
      default:
        if (this.binding) {
          throw new Error(`Invalid binding '${this.binding}'`);
        } else {
          if (this.resource) {
            throw new Error(`Use of the unbound action '${this.name}' by a resource '${this.resource._url}' is not intended`)
          }
          path = asRegex ? new RegExp(`(node\.odata)?\/?${this.name}$`) : `/node.odata.${this.name}`;
        }
        break;
    }
    return path;
  }

  getOperationRouter(path, fn, auth) {
    const router = Router();

    router.post(path, (req, res, next) => {
      pipes.authorizePipe(req, res, auth)
        .then(() => fn(req, res, next))
        .catch((result) => pipes.errorPipe(req, res, result));
    });

    return router;
  };
} 