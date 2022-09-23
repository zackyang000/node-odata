import Model from './fake-db-model';

export default class {
  constructor() {
    this._models = {};
  }

  addData(name, data) {
    return this._models[name].addData(data);
  }

  createConnection() {
    return this;
  }

  register(name, model) {
    this._models[name] = new Model(name, model);
    return this._models[name];
  }

  on(name, event) {

  }
}