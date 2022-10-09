import rest from './rest';
import { min } from './utils';

function hook(resource, pos, fn) {
  let method = resource._currentMethod;
  if (method === 'all') {
    method = ['get', 'post', 'put', 'delete', 'patch', 'list'];
  } else {
    method = [method];
  }
  /*eslint-disable */
  method.map((curr) => {
    if (resource._hooks[curr][pos]) {
      const _fn = resource._hooks[curr][pos];
      resource._hooks[curr][pos] = (...args) => {
        _fn.apply(resource, args);
        fn.apply(resource, args);
      };
    } else {
      resource._hooks[curr][pos] = fn;
    }
  });
  /* eslint-enable */
}

export default class {
  constructor(server, name, userModel) {
    this._server = server;
    this._name = name;
    this._url = name;
    this._model = userModel;
    this._hooks = {
      list: {},
      get: {},
      post: {},
      put: {},
      delete: {},
      patch: {},
    };
    this.actions = {};
    this._options = {
      maxTop: 10000,
      maxSkip: 10000,
      orderby: undefined,
    };
  }

  getName() {
    return this._name;
  }

  setModel(model) {
    this.model = model;
  }

  action(url, fn, options) {
    let auth;
    let binding;

    if (options) {
      auth = options.auth;
      binding = options.binding;
    }

    this.actions[url] = fn;
    this.actions[url].auth = auth;
    this.actions[url].binding = binding;
    this.actions[url].resource = this._url;

    const resourceUrl = !binding || binding === 'entity' // 'entity' || 'collection'
      ? `/${this._url}\\(:id\\)` : `/${this._url}`;
    this.actions[url].router = rest.getOperationRouter(resourceUrl, url, fn, auth);

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

  patch() {
    this._currentMethod = 'patch';
    return this;
  }

  all() {
    this._currentMethod = 'all';
    return this;
  }

  before(fn) {
    hook(this, 'before', fn);
    return this;
  }

  after(fn) {
    hook(this, 'after', fn);
    return this;
  }

  auth(fn) {
    let method = this._currentMethod;
    if (method === 'all') {
      method = ['get', 'post', 'put', 'delete', 'patch', 'list'];
    } else {
      method = [method];
    }
    method.map((curr) => {
      this._hooks[curr].auth = fn;
      return undefined;
    });
    return this;
  }

  url(url) {
    this._url = url;
    return this;
  }

  _router(setting = {}) {
    // remove '/' if url is startwith it.
    if (this._url.indexOf('/') === 0) {
      this._url = this._url.substr(1);
    }

    // not allow contain '/' in url.
    if (this._url.indexOf('/') >= 0) {
      throw new Error(`Url of resource[${this._name}] can't contain "/",`
        + 'it can only be allowed to exist in the beginning.');
    }

    const params = {
      url: this._url,
      options: {
        maxTop: min([setting.maxTop, this._maxTop]),
        maxSkip: min([setting.maxSkip, this._maxSkip]),
        orderby: this._orderby || setting.orderby,
      },
      hooks: this._hooks,
    };

    return rest.getRouter(this.model, params);
  }

  find() {
    return this.model.find();
  }
}
