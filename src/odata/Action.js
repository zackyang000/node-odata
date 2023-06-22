import { Router } from 'express';
import Hooks from './Hooks';
import { validateParameters, validateIdentifier } from './validator';
import Console from '../writer/Console';

export default class Action {
  constructor(name, fn, options) {

    this.name = name;
    this.fn = async (req, res, next) => {
      try {
        const con = new Console();

        con.debug(`Action ${this.name} started`);

        res.$odata.status = 200;
        const result = fn(req, res, next);

        if (result || res.$odata.status === 204) {
          if (result.then) {
            await result;
          } 

          next();
        }
        
      } catch (error) {
        next(error);
      }
    }
    this.hooks = new Hooks();

    if (options) {
      this.binding = options.binding;
      this.resource = options.resource;
      this.$Parameter = options.$Parameter;
    }
  }

  addBefore(fn, name) {
    this.hooks.addBefore(fn, name);
  }

  addAfter(fn, name) {
    this.hooks.addAfter(fn, name);
  }

  match(method, url) {
    const regex = this.getPath(true);

    if (method === 'post' && url.match(regex)) {
      return [...this.hooks.before, this.fn, ...this.hooks.after];
    }
  }

  getRouter() {
    if (!this.router) {
      validateIdentifier(this.name);

      if (this.$Parameter) {
        validateParameters(this.$Parameter);
      }

      const path = this.getPath();

      this.router = this.getOperationRouter(path, this.fn);
    }

    return this.router;
  }

  getMetadata() {
    const result = {
      $Kind: 'Action'
    };

    if (this.binding) {
      result.$IsBound = true;
      result.$Parameter = [{
        $Name: this.resource._url || this.resource.name,
        $Type: `node.odata.${this.resource._url || this.resource.name}`,
        $Collection: this.binding === 'collection' ? true : undefined,
      }];
    }

    if (this.$Parameter) {
      if (!result.$Parameter) {
        result.$Parameter = [];
      }

      this.$Parameter.forEach(para => {
        const item = para;

        if (para.$Type.search(/^edm/i) === -1 ) {
          item.$Type = `${para.$Type}`;
        }

        result.$Parameter.push(item);
      });
      result.$Parameter = result.$Parameter ? result.$Parameter.concat() : this.$Parameter;
    }

    return result;
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

  getOperationRouter(path, fn) {
    let router = Router();

    router.post(path, ...this.hooks.before, fn, ...this.hooks.after);

    return router;
  };
} 