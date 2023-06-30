import { validateIdentifier, validate } from "./validator";
import { Router } from 'express';
import Hooks from "./Hooks";

export default class Entity {
  constructor(name, handler, metadata) {
    const notImplemented = (req, res) => {
      const error = new Error();
      
      error.status = 501;
      throw error;
    };

    this.name = name;
    this.handler = {
      list: notImplemented,
      get: notImplemented,
      post: notImplemented,
      put: notImplemented,
      delete: notImplemented,
      patch: notImplemented,
      count: notImplemented,
      ...handler
    };
    this.metadata = {
      $Kind: 'EntityType',
      ...metadata
    };
    
    this.actions = {};
    this.hooks = new Hooks();
  }

  addBefore(fn, name) {
    this.hooks.addBefore(fn, name);
  }

  addAfter(fn, name) {
    this.hooks.addAfter(fn, name);
  }

  action(name, fn, options) {
    this.actions[name] = new Action(name, fn,
      {
        ...options,
        resource: this
      });

    return this.actions[name];
  }

  match(method, url) {
    validateIdentifier(this.name);

    const routes = this.getRoutes();
    const route = routes.find((item) => {
      if (item.method === method) {
        const match = url.match(item.regex);

        return match;
      }
    });

    if (route) {
      return [
        ...this.hooks.before,
        this.handler[route.name],
        ...this.hooks.after,
        this.convertAttributes.bind(this)
      ];
    }

    return Object.keys(this.actions)
      .map(name => this.actions[name].match(method, url))
      .find(ctrl => ctrl);
  }

  // convert DattimeOffset to valid value
  convertAttributes(req, res, next) {
    if (res.$odata.result?.value && Array.isArray(res.$odata.result?.value)) {
      // list of entities
      res.$odata.result.value.forEach(this.checkPropertyValues.bind(this));
    } else if (res.$odata.result) {
      this.checkPropertyValues(res.$odata.result);
    }
    next();
  }

  checkPropertyValues(entity) {
    const entityMetadata = this.getMetadata();
    const keys = Object.keys(entity);

    keys.forEach(member => {
      if (entityMetadata[member]?.$Type === "Edm.DateTimeOffset" 
        && Object.prototype.toString.call(entity[member]) === '[object Date]') {
          entity[member] = entity[member].toISOString().replace(/\.[0-9]{3}/,'')
        }
    });
  }

  getRouter() {
    validateIdentifier(this.name);
    validate(this.metadata);

    const router = Router();
    const routes = this.getRoutes(this.name);

    routes.forEach((route) => {
      const {
        name, method, url
      } = route;
      router[method](url, ...this.hooks.before,
        (req, res, next) => {
          res.$odata.status = 200;
          this.handler[name](req, res, next);
        },
        this.convertAttributes.bind(this),
        ...this.hooks.after);
    });
    return router;
  }

  getMetadata() {
    return this.metadata;
  }

  getRoutes() {
    const resourceListURL = `/${this.name}`;
    const resourceListRegex = new RegExp(`(^\/?${this.name}[?#])|(^\/?${this.name}$)`);
    const resourceURL = `${resourceListURL}\\(:id\\)`;
    const resourceRegex = new RegExp(`^\/?${this.name}\\([^)]+\\)`);
  
    return [
      {
        name: 'post',
        method: 'post',
        url: resourceListURL,
        regex: resourceListRegex
      },
      {
        name: 'put',
        method: 'put',
        url: resourceURL,
        regex: resourceRegex
      },
      {
        name: 'patch',
        method: 'patch',
        url: resourceURL,
        regex: resourceRegex
      },
      {
        name: 'delete',
        method: 'delete',
        url: resourceURL,
        regex: resourceRegex
      },
      {
        name: 'get',
        method: 'get',
        url: resourceURL,
        regex: resourceRegex
      },
      {
        name: 'count',
        method: 'get',
        url: resourceListURL + '/([\$])count',
        regex: new RegExp(`(^\/?${this.name}\/\\$count[?]?)|(^\/?${this.name}\/\\$count$)`)
      },
      {
        name: 'list',
        method: 'get',
        url: resourceListURL,
        regex: resourceListRegex
      }
    ];
  }

}