export default class Adapter {
  constructor(model) {
    this.model = model;
  }

  list(query) {
  }

  get(id) {
    return new Promise((resolve, reject) => {
      this.model.findById(id, (err, entity) => {
        if (err) {
          return reject(err);
        }

        if (!entity) {
          return reject({ status: 404 }, { text: 'Not Found' });
        }

        return resolve({ entity });
      });
    });
  }

  create(data) {
    return new Promise((resolve, reject) => {
      if (!Object.keys(data).length) {
        return reject({ status: 422 });
      }

      const entity = new this.model(data);
      entity.save((err) => {
        if (err) {
          return reject(err);
        }
        return resolve({ status: 201, entity });
      });
    });
  }

  update(data) {
  }

  patch(id, data) {
    return new Promise((resolve, reject) => {
      this.model.findById(id, (err, entity) => {
        if (err) {
          return reject(err);
        }

        this.model.update({ id }, { ...entity, ...data }, (err1) => {
          if (err1) {
            return reject(err1);
          }
          return resolve({ entity: req.body, originEntity: entity });
        });
      });
    });
  }

  remove(id) {
    return new Promise((resolve, reject) => {
      this.model.remove({ _id: id }, (err, result) => {
        if (err) {
          return reject(err);
        }

        if (JSON.parse(result).n === 0) {
          return reject({ status: 404 }, { text: 'Not Found' });
        }

        return resolve({ status: 204 });
      });
    });
  }
}
