export default class {
  constructor(mongooseModel) {
    this._mongooseModel = mongooseModel;
  }

  create(data) {
    return new this._mongooseModel(data);
  }

  find() {
    return this._mongooseModel.find();
  }

  findById(id, callback) {
    this._mongooseModel.findById(id, callback);
  }

  findByIdAndUpdate(id, data, callback) {
    this._mongooseModel.findByIdAndUpdate(id, data, callback);
  }

  findOne(filter, callback) {
    this._mongooseModel.findOne(filter, callback);
  }

  remove(filter, callback) {
    this._mongooseModel.remove(filter, callback);
  }

  update(filter, data, callback) {
    this._mongooseModel.update(filter, data, callback);
  }

}
