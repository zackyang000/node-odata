const debug = require('debug')('node-odata:resources');
const _CLASS_RESOURCE_SYMBOL_ = Symbol('_CLASS_RESOURCE_');
const Query = require('./mongo/Query');

class Resource {
  constructor(name, schema) {
    this.name = name;
    this.schema = schema;
    debug(`register a resource named '%s'`, name)
  }

  static get _RESOURCE_() {
    return _CLASS_RESOURCE_SYMBOL_;
  }

  setModel(model) {
    this.model = model;
  }

  async list(quertstring, opts) {
    const query = new Query(this.model);
    try {
      const data = await query.list(quertstring, opts);
      console.log('data', data.entity)
      return data.entity;
    } catch(e) {
      debug(e)
    }
  }

  async get(id) {
  }

  async create(entity) {
  }

  async update(entity) {
  }

  async remove(id) {
  }

  async patch(entity) {
  }
}

module.exports = Resource;
