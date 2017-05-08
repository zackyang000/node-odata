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

  update(id, data) {
    return new Promise((resolve, reject) => {
      this.model.findOne({ _id: id }, (err, entity) => {
        if (err) {
          return reject(err);
        }

        // update resource
        if (entity) {
          return this.model.findByIdAndUpdate(entity.id, data, (err) => {
            if (err) {
              return reject(err);
            }
            const newEntity = data;
            newEntity.id = entity.id;
            return resolve({ entity: newEntity, originEntity: entity });
          });
        }

        // create resource
        const uuidReg = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
        if (!uuidReg.test(id)) {
          return reject({ status: 400 }, { text: 'Id is invalid.' });
        }
        const newEntity = new this.model(data);
        newEntity._id = id;
        this.create(newEntity).then(resolve).catch(reject);
      });
    });
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
          return resolve({ entity: data, originEntity: entity });
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
