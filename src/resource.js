"use strict";

import { min } from 'lodash';
import model from './model';
import rest from './rest';

class Resource {
  constructor(name, model) {
    this._name = name;
    this._url = name;
    this._model = model;
    this._rest = {
      list: {},
      get: {},
      post: {},
      put: {},
      delete: {},
    };
    this._actions = {};
    this._options = {};
  }

  action(url, fn, auth) {
    this._actions[url] = fn;
    this._actions[url].auth = auth;
    return this;
  }

  maxTop(count) {
    this._maxTop = count;
    return this;
  }

  maxSkip(count) {
    this._maxSkip = count;
    return this;
  }

  orderBy(field) {
    this._orderby = field;
    return this;
  }

  list() {
    this._currentMethod = 'list';
    return this;
  }

  get() {
    this._currentMethod = 'get';
    return this;
  }

  post() {
    this._currentMethod = 'post';
    return this;
  }

  put() {
    this._currentMethod = 'put';
    return this;
  }

  delete() {
    this._currentMethod = 'delete';
    return this;
  }

  all() {
    //TODO
    throw new Error('Not implemented');
  }

  before(fn) {
    this._rest[this._currentMethod].before = fn;
    return this;
  }

  after(fn) {
    this._rest[this._currentMethod].after = fn;
    return this;
  }

  auth(fn) {
    this._rest[this._currentMethod].auth = fn;
    return this;
  }

  url(url) {
    this._url = url;
    return this;
  }

  _router(db, setting = {}) {
    // remove '/' if url is startwith it.
    if (this._url.indexOf('/') === 0) {
      this._url = this._url.substr(1);
    }

    // not allow contain '/' in url.
    if (this._url.indexOf('/') >= 0) {
      throw new Error(`Url of resource[${this._name}] can\'t contain "/", it can only be allowed to exist in the beginning.`);
    }

    model.register(db, this._url, this._model);

    const params = {
      options: {
        maxTop: min([setting.maxTop || 100000, this._maxTop || 100000]),
        maxSkip: min([setting.maxSkip || 100000, this._maxSkip || 100000]),
        orderby: this._orderby,
      },
      rest: this._rest,
      actions: this._actions,
    };

    return rest.getRouter(db, this._url, params);
  }
}

export default Resource;

