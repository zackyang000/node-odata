export default class Adapter {
  constructor(model) {
    this.model = model;
  }

  delete(id) {
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
