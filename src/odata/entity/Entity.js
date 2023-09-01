import { validateIdentifier, validate } from "../validator";
import { Router } from 'express';
import Hooks from "../Hooks";
import Action from '../Action';
import parseSelect from './parser/select';
import parseKeys from './parser/keys';
import parseCount from './parser/count';
import parseFilter from './parser/filter';
import parseOrderBy from "./parser/orderby";
import { parseSkip, parseTop } from "./parser/skiptop";

export default class Entity {
  constructor(name, handler, metadata, settings, annotations, mapping) {
    const notImplemented = op => (req, res) => {
      const error = new Error(`Operation '${op}' is not implemented'`);

      error.status = 501;
      throw error;
    };

    this.name = name;
    this.handler = {
      list: notImplemented('list'),
      get: notImplemented('get'),
      post: notImplemented('post'),
      put: notImplemented('put'),
      delete: notImplemented('delete'),
      patch: notImplemented('patch'),
      count: notImplemented('count'),
      ...handler
    };
    this.metadata = {
      $Kind: 'EntityType',
      ...metadata
    };

    this.actions = {};
    this.hooks = new Hooks();

    this.options = {
      ...settings
    };

    this.annotations = annotations;
    this.mapping = mapping || {};
  }

  addBefore(fn, name) {
    this.hooks.addBefore(fn, name);
  }

  addAfter(fn, name) {
    this.hooks.addAfter(fn, name);
  }

  action(name, fn, options) {
    this.actions[name] = new Action(name, fn, this.annotations,
      {
        ...options,
        resource: this
      });

    return this.actions[name];
  }

  match(method, url) {
    validateIdentifier(this.name);

    const action = Object.keys(this.actions)
      .map(name => this.actions[name].match(method, url))
      .find(ctrl => ctrl);
    if (action) {
      return action
    }

    const routes = this.getRoutes();
    const route = routes.find((item) => {
      if (item.method === method) {
        const match = url.match(item.regex);

        return match;
      }
    });

    return route && [
      this.parsingMiddleware.bind(this),
      ...this.hooks.before,
      this.ctrl(route.name, this.handler[route.name]),
      ...this.hooks.after,
      this.adaptResultAccordingMetadata.bind(this)
    ];


  }

  // convert DattimeOffset to valid value
  adaptResultAccordingMetadata(req, res, next) {
    if (res.$odata.result?.value && Array.isArray(res.$odata.result?.value)) {
      // list of entities
      res.$odata.result.value.forEach(this.adaptEntityAccordingMetadata.bind(this));
    } else if (res.$odata.result) {
      this.adaptEntityAccordingMetadata(res.$odata.result);
    }
    next();
  }

  get(key) {
    if (value) {
      if (Number.isNaN(+value) || +value < 0) {
        throw new Error(`Max-Skip value should be a positive number`);
      }
      this.options.maxSkip = value;
    }

    return this.options[key];
  }

  set(key, value) {
    const positiveOnly = value => {
      if (value && (Number.isNaN(+value) || +value < 0)) {
        throw new Error(`'${key}' value should be a positive number`);
      }
    };

    switch (key) {
      case 'maxSkip':
      case 'maxTop':
        positiveOnly(value);
        this.options[key] = value;
        break;
    }

  }

  parsingMiddleware(req, res, next) {
    try {
      req.$odata.$Key = parseKeys(req, this.name, this.metadata, this.mapping);
      req.$odata.$select = parseSelect(req, this.name, this.metadata, this.mapping);
      req.$odata.$filter = parseFilter(req, this.name, this.metadata, this.mapping);
      req.$odata.$count = parseCount(req, this.name, this.metadata);
      req.$odata.$orderby = parseOrderBy(req, this.name, this.metadata, this.mapping, this.options.orderby);
      req.$odata.$skip = parseSkip(req, this.options.maxSkip);
      req.$odata.$top = parseTop(req, this.options.maxTop);

      req.$odata = {
        ...req.$odata,
        body: req.body,
        $expand: req.query.$expand, // TODO : implement expand
        $search: req.query.$search // TODO : implement search
      };

      next();

    } catch (err) {
      next(err);
    }
  }

  adaptEntityAccordingMetadata(entity) {
    const entityMetadata = this.getMetadata();
    const keys = Object.keys(entity);

    keys.forEach(member => {
      let propertyMetadata;

      if (entityMetadata[member]) {
        propertyMetadata = entityMetadata[member];

      } else {
        const keys = Object.keys(this.mapping);
        const mapping = keys.find(name => this.mapping[name].target === member);

        if (mapping) {
          propertyMetadata = this.mapping[mapping].attributes;
          entity[mapping] = entity[member];

        }

        delete entity[member]; // hide attributes not exposed in metadata

      }

      if (!propertyMetadata) {
        return;
      }

      if (propertyMetadata.$Type === "Edm.DateTimeOffset"
        && Object.prototype.toString.call(entity[member]) === '[object Date]') {
        entity[member] = entity[member].toISOString().replace(/\.[0-9]{3}/, '')
      }
    });
  }

  getRouter() {
    validateIdentifier(this.name);
    validate(this.metadata);

    const actions = Object.keys(this.actions)
      .map(name => this.actions[name].getRouter());

    const router = Router();
    const routes = this.getRoutes();

    routes.forEach((route) => {
      const {
        name, method, url
      } = route;
      const hooksAfter = name === 'count' ? [...this.hooks.after] : [
        this.adaptResultAccordingMetadata.bind(this),
        ...this.hooks.after
      ];

      router[method](url,
        this.parsingMiddleware.bind(this),
        ...this.hooks.before,
        this.ctrl(name, this.handler[name]),
        ...hooksAfter);
    });

    return [actions, router];
  }

  getNavigation() {
    return {
      url: this.getResourceUrl(),
      beforeHooks: [this.parsingMiddleware.bind(this)]
    };
  }

  ctrl(name, handler) {
    return async (req, res, next) => {
      try {
      res.$odata.status = 200;

      if (name === 'list' && req.$odata.$count) {
        const countResponse = {
          $odata: {}
        };

        this.handler.count(req, countResponse, async err => {
          if (err) {
            next(err);
            return;
          }

          res.$odata.result = {
            ['@odata.count']: countResponse.$odata.result
          };
          await handler(req, res, next);
        });

      } else {
        await handler(req, res, next);

      }

    } catch(err) { 
      next(err);
    }
    };
  }

  getMetadata() {
    return this.metadata;
  }

  annotateProperty(prop, anno, value) {
    if (!prop) {
      throw new Error('Property name should be given');
    }
    if (!anno) {
      throw new Error('Name of annotation term should be given');
    }
    const term = `@${anno}`;

    if (!this.metadata[prop]) {
      throw new Error(`Entity '${this.name}' doesn't have property named '${prop}'`);
    }

    if (this.metadata[prop][term]) {
      throw new Error(`property '${prop}' is allready annotated with term '${anno}'`);
    }

    this.metadata[prop] = {
      ...this.metadata[prop],
      ...this.annotations.annotate(anno, 'Property', value)
    };
  }

  getKeyParam(type, name) {
    switch (type) {
      case 'Edm.String':
        return `%27:${name}%27`;

      default:
        return `:${name}`;
    }
  }

  getResourceUrl(name) {
    const entityName = name || this.name;
    const resourceListURL = `/${entityName}`;

    if (this.metadata.$Key.length === 1) {
      const value = this.getKeyParam(this.metadata[this.metadata.$Key[0]].$Type, this.metadata.$Key[0]);

      return `${resourceListURL}\\(${value}\\)`;

    } else {
      let result = this.metadata.$Key.reduce((previous, current, index) => {
        const key = this.metadata[current];
        const value = this.getKeyParam(this.metadata[current].$Type, current);

        return !index ? `${previous}${key}=${value}` : `${previous},${key}=${value}`;
      }, `${resourceListURL}\\(`);

      return `${result}\\)`;
    }
  }

  getRoutes(name) {
    const entityName = name || this.name;
    const resourceListURL = `/${entityName}`;
    const resourceListRegex = new RegExp(`(^\/?${entityName}[?#])|(^\/?${entityName}$)`);
    const resourceURL = this.getResourceUrl(name);
    const resourceRegex = new RegExp(`^\/?${entityName}\\([^)]+\\)`);

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
        regex: new RegExp(`(^\/?${entityName}\/\\$count[?]?)|(^\/?${entityName}\/\\$count$)`)
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