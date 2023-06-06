export default class {
  constructor(mongooseModel) {
    this.model = mongooseModel;
  }

  create(data) {
    const MongooseModel = this.model;
    return new MongooseModel(data);
  }

  async countDocuments() {
    return await this.model.countDocuments();
  }

  find() {
    return this.model.find();
  }

  async findById(id, callback) {
    return await this.model.findById(id, callback);
  }

  async findByIdAndUpdate(id, data, callback) {
    return await this.model.findByIdAndUpdate(id, data, callback);
  }

  async findOne(filter, callback) {
    return await this.model.findOne(filter, callback);
  }

  async remove(filter, callback) {
    return await this.model.remove(filter, callback);
  }

  async update(filter, data, callback) {
    return await this.model.update(filter, data, callback);
  }
}
