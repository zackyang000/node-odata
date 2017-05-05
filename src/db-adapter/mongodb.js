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
  }

  update(data) {
  }

  patch(data) {
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
