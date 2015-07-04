import { min } from 'lodash';
import model from './model';
import rest from './rest';

const resource = {};

resource.init = function(name, model) {
  this.name = name;
  this.url = name;
  this.model = model;
  this._actions = {};
  this.options = {};
  return this;
};

resource.action = function(url, callback) {
  this._actions[url] = callback;
  return this;
};

resource._router = function(db) {
  // remove '/' if url is startwith it.
  if (this.url.indexOf('/') === 0) {
    this.url = this.url.substr(1);
  }

  // not allow contain '/' in url.
  if (this.url.indexOf('/') >= 0) {
    throw new Error(`Url of resource[${this.name}] can\'t contain "/", it can only be allowed to exist in the beginning.`);
  }

  model.register(db, this.url, this.model);

  // this.options.maxTop = min([this.get('maxTop'), this.options.maxTop]);
  // this.options.maxSkip = min([this.get('maxSkip'), this.options.maxSkip]);

  return rest.getRouter(db, this.url, this.options);
};

export default resource;

