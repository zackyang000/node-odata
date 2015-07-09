import { min } from 'lodash';
import model from './model';
import rest from './rest';

const resource = {};

resource.init = function(name, model) {
  this._name = name;
  this._url = name;
  this._model = model;
  this._rest = {
    get: {},
    post: {},
    put: {},
    delete: {},
  };
  this._actions = {};
  this._options = {};
  return this;
};

resource.action = function(url, fn, auth) {
  this._actions[url] = fn;
  this._actions[url].auth = auth;
  return this;
};

resource.maxTop = function(count) {
  this._maxTop = count;
  return this;
};

resource.maxSkip = function(count) {
  this._maxSkip = count;
  return this;
};

resource.orderBy = function(field) {
  this._orderby = field;
  return this;
};

resource.get = function() {
  this._currentMethod = 'get';
  return this;
};

resource.getAll = function() {
  this._currentMethod = 'getAll';
  return this;
};

resource.post = function() {
  this._currentMethod = 'post';
  return this;
};

resource.put = function() {
  this._currentMethod = 'put';
  return this;
};

resource.delete = function() {
  this._currentMethod = 'delete';
  return this;
};

resource.all = function() {
  //TODO
  throw new Error('Not implemented');
};

resource.before = function(fn) {
  this._rest[this._currentMethod].before = fn;
  return this;
};

resource.after = function(fn) {
  this._rest[this._currentMethod].after = fn;
  return this;
};

resource.auth = function(fn) {
  this._rest[this._currentMethod].auth = fn;
  return this;
};

resource._router = function(db, setting = {}) {
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
};

export default resource;

