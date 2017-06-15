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

  async list() {
    const query = new Query(this.model);
    const data = await query.list();
    console.log(data)
    return data;
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
