import countParser from '../parser/countParser';
import filterParser from '../parser/filterParser';
import orderbyParser from '../parser/orderbyParser';
import skipParser from '../parser/skipParser';
import topParser from '../parser/topParser';
import selectParser from '../parser/selectParser';

export default class Adapter {
  constructor(model) {
    this.model = model;
  }

  list(query, options) {
    return new Promise((resolve, reject) => {
      function _countQuery(model, { count, filter }) {
        return new Promise((resolve, reject) => {
          countParser(model, count, filter).then(dataCount =>
          (dataCount !== undefined
            ? resolve({ '@odata.count': dataCount })
            : resolve({})
          )).catch(reject);
        });
      }

      function _dataQuery(model, { filter, orderby, skip, top, select }, options) {
        return new Promise((resolve, reject) => {
          const query = model.find();
          filterParser(query, filter)
            .then(() => orderbyParser(query, orderby || options.orderby))
            .then(() => skipParser(query, skip, options.maxSkip))
            .then(() => topParser(query, top, options.maxTop))
            .then(() => selectParser(query, select))
            .then(() => query.exec((err, data) => {
              if (err) {
                return reject(err);
              }
              return resolve({ value: data });
            }))
            .catch(reject);
        });
      }

      const params = {
        count: query.$count,
        filter: query.$filter,
        orderby: query.$orderby,
        skip: query.$skip,
        top: query.$top,
        select: query.$select,
      };

      Promise.all([
        _countQuery(this.model, params),
        _dataQuery(this.model, params, options),
      ]).then((results) => {
        const entity = results.reduce((current, next) => ({ ...current, ...next }));
        resolve({ entity });
      }).catch(err => reject({ status: 500, text: err }));
    });
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
