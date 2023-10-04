import { Router } from 'express';
import Hooks from './Hooks';
import { validateParameters, validateIdentifier } from './validator';
import parseValue from './parser/value';

export default class Action {
  constructor(name, fn, annotations, options) {

    this.name = name;
    this.fn = async (req, res, next) => {
      try {
        res.$odata.status = 200;

        const result = fn(req, res, next);

        if (result || res.$odata.status === 204) {
          if (result?.then) {
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
      Object.keys(options).forEach(name => {
        if (['binding', 'resource', '$Parameter'].indexOf(name) === -1) {
          throw new Error(`Option '${name}' is not supported`);
        }
      });
    }

    this.binding = options?.binding;
    this.resource = options?.resource;
    this.$Parameter = options?.$Parameter || [];
    this.annotations = annotations;

    if (this.binding === 'entity') {
      this.addBefore(this.resource.getNavigation().beforeHooks);
    }

    this.addBefore(this.parseParameter.bind(this));
  }

  annotate(anno, value) {
    if (!anno) {
      throw new Error('Name of annotation term should be given');
    }

    const term = `@${anno}`;
    const list = this.annotations.items[anno];

    this.getMetadata();

    if (list?.item?.indexOf('parameter') >= 0) {
      if (!Array.isArray(value) || !value.length) {
        throw new Error('List of parameter names was expected');
      }

      value.forEach(param => {
        if (!this.metadata.$Parameter.find(item => item.$Name === param)) {
          throw new Error(`Unknown parameter with name '${param}'`);
        }
      });
    }

    this.metadata[term] = this.annotations.annotate(anno, 'Action', value)[term];
  }

  annotateParameter(name, anno, value) {
    if (!name) {
      throw new Error('Parameter name should be given');
    }
    if (!anno) {
      throw new Error('Name of annotation term should be given');
    }
    const term = `@${anno}`;

    this.getMetadata();

    const param = this.metadata.$Parameter.find(item => item.$Name === name);

    if (!param) {
      throw new Error(`Entity '${this.name}' doesn't have parameter named '${name}'`);
    }

    if (param[term]) {
      throw new Error(`Parameter '${name}' is allready annotated with term '${anno}'`);
    }
    
    param[term] = this.annotations.annotate(anno, 'Parameter', value)[term];
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
      return this.getMiddlewares();
    }
  }

  getRouter() {
    if (!this.router) {
      const path = this.getPath();

      this.router = Router();
      this.router.post(path, ...this.getMiddlewares());
    }

    return this.router;
  }

  getMetadata() {
    if (!this.metadata) {
      const result = {
        $Kind: 'Action'
      };

      if (this.binding) {
        result.$IsBound = true;
        result.$Parameter = [{
          $Name: this.resource.name,
          $Type: `node.odata.${this.resource.name}`,
          $Collection: this.binding === 'collection' ? true : undefined,
        }];
      }

      if (this.$Parameter.length) {
        if (!result.$Parameter) {
          result.$Parameter = [];
        }

        this.$Parameter.forEach(para => {
          const item = para;

          if (para.$Type.search(/^edm/i) === -1) {
            item.$Type = `${para.$Type}`;
          }

          result.$Parameter.push(item);
        });
        result.$Parameter = result.$Parameter ? result.$Parameter.concat() : this.$Parameter;
      }

      this.metadata = result;
    }

    return this.metadata;
  }

  getPath(asRegex) {
    let path;

    switch (this.binding) {
      case 'entity':
        if (!this.resource) {
          throw new Error(`Binding '${this.binding}' require a resource`)
        }
        path = asRegex ? new RegExp(`\/?${this.resource.name}\\('?[A-Fa-f0-9]*'?\\)\/${this.name}$`) : `${this.resource.getNavigation().url}/${this.name}`;
        break;
      case 'collection':
        if (!this.resource) {
          throw new Error(`Binding '${this.binding}' require a resource`)
        }
        path = asRegex ? new RegExp(`\/?${this.resource.name}\/${this.name}$`) : `/${this.resource.name}/${this.name}`;
        break;
      default:
        if (this.binding) {
          throw new Error(`Invalid binding '${this.binding}'`);
        } else {
          if (this.resource) {
            throw new Error(`Use of the unbound action '${this.name}' by a resource '${this.resource.name}' is not intended`)
          }
          path = asRegex ? new RegExp(`(node\.odata)?\/?${this.name}$`) : `/node.odata.${this.name}`;
        }
        break;
    }
    return path;
  }

  getMiddlewares() {
    if (!this.midddlewares) {
      validateIdentifier(this.name);

      if (this.$Parameter.length) {
        validateParameters(this.$Parameter);
      }

      this.midddlewares = [...this.hooks.before, this.fn, ...this.hooks.after];
    }

    return this.midddlewares;
  }

  parseParameter(req, res, next) {
    try {
      if (req.body) {
        req.$odata.$Parameter = {};
      }

      this.$Parameter.forEach(param => {
        if (req.body && req.body[param.$Name]) {
          if (param.$Type.indexOf('node.odata') === -1) {
            req.$odata.$Parameter[param.$Name] = parseValue(req.body[param.$Name], param);
          } else {
            req.$odata.$Parameter[param.$Name] = req.body[param.$Name];
          }

        } else if (!param.$Nullable && (!req.body || !req.body[param.$Name])) {
          const error = new Error(`Obligatory parameter '${param.$Name}' not given`);

          error.status = 400;

          throw error;
        }
      });

      next();

    } catch (err) {
      next(err);
    }
  }

} 