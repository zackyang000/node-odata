import Entity from "./Entity";
import { validate, validateIdentifier } from "../validator";
import Hooks from "../Hooks";
import { Router } from 'express';

export default class Singleton {
  constructor(name, handler, metadata, annotations) {
    const notSupported = (req, res) => {
      const error = new Error();

      error.status = 405;
      throw error;
    };

    this.name = name;
    this._entity = metadata instanceof Entity ? metadata : new Entity(name, handler, metadata, null, annotations);

    this.handler = {
      ...this.entity.handler, // get, post, put, delete, patch
      list: notSupported,
      count: notSupported,
      ...handler
    };

    this.hooks = new Hooks();

  }

  get entity () {
    return this._entity;
  }

  set entity(value) {
    this._entity = value;
  }

  get mapping() {
    return this.entity.mapping;
  }

  set mapping(value) {
    this.entity.mapping = value;
  }

  get clientField() {
    return this.entity.clientField;
  }

  set clientField(value) {
    this.entity.clientField = value; 
  }

  addBefore(fn, name) {
    this.hooks.addBefore(fn, name);
  }

  addAfter(fn, name) {
    this.hooks.addAfter(fn, name);
  }

  getMetadata() {
    return this.entity.getMetadata();
  }

  match(method, url) {
    validateIdentifier(this.name);

    const routes = this.getRoutes()
    const route = routes.find((item) => {
      if (item.method === method) {
        const match = url.match(item.regex);

        return match;
      }
    });

    return route && [
      this.entity.parsingMiddleware.bind(this.entity),
      ...this.hooks.before,
      this.ctrl(route.name, this.handler[route.name]),
      ...this.hooks.after,
      this.entity.adaptResultAccordingMetadata.bind(this.entity)
    ];


  }

  getRouter() {
    validateIdentifier(this.name);
    validate(this.entity.metadata);

    const router = Router();
    const routes = this.getRoutes();

    routes.forEach((route) => {
      const {
        name, method, url
      } = route;

      router[method](url,
        this.entity.parsingMiddleware.bind(this.entity),
        ...this.hooks.before,
        this.ctrl(name, this.handler[name]),
        this.entity.adaptResultAccordingMetadata.bind(this.entity),
        ...this.hooks.after);
    });

    return [router];
  }

  ctrl(name, handler) {
    return async (req, res, next) => {
      try {
      res.$odata.status = 200;
      await handler(req, res, next);

    } catch(err) { 
      next(err);
    }
    };
  }

  getRoutes() {
    const name = this.name === this.entity.name ? undefined : this.name;
    const listRoute = this.entity.getRoutes(name).find(item => item.name === 'list');

    return [ 'post', 'put', 'patch', 'delete', 'get'].map(item => ({
        name: item,
        method: item,
        url: listRoute.url,
        regex: listRoute.regex
      }));
  }


  annotate(anno, value) {
    this.entity.annotate(anno, value);
  }

  annotateProperty(prop, anno, value) {
    this.entity.annotateProperty(prop, anno, value);
  }
}