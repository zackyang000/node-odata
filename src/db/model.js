export default class {
  constructor(mongooseModel) {
    this.model = mongooseModel;
  }

  create(data) {
    const MongooseModel = this.model;
    return new MongooseModel(data);
  }

  find() {
    return this.model.find();
  }

  findById(id, callback) {
    this.model.findById(id, callback);
  }

  findByIdAndUpdate(id, data, callback) {
    this.model.findByIdAndUpdate(id, data, callback);
  }

  findOne(filter, callback) {
    this.model.findOne(filter, callback);
  }

  remove(filter, callback) {
    this.model.remove(filter, callback);
  }

  update(filter, data, callback) {
    this.model.update(filter, data, callback);
  }

}
