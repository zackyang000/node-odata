export default class Model {
  constructor(name, model) {
    this._name = name;
    this._data = [];
    this._count = 1;
    this.model = {
      schema: {
        ...model,
        tree: {
          id: { select: true },
          ...model
        },
        paths: Model.toPath(model)
      }
    };
  }

  static toPath(model, prefix) {
    let result = {};

    Object.keys(model).forEach((item) => {
      const propName = prefix ? `${prefix}.${item}` : item;

      if (Array.isArray(model[item])) {
        result[propName] = {
          path: propName,
          instance: 'Array'
        };
        if (model[item][0].name) {
          // Array of primitive Types
          result[propName].options = {
            type: [{
              name: model[item][0].name
            }]
          };
        } else if(model[item][0].enum) {
          // Array of Enum values
          result[propName].options = {
            type: [{
              type: {
                name: model[item][0].type.name
              },
              enum: model[item][0].enum
            }]
          };
        } else {
          // Array of objects
          result[propName].schema = {
            paths: Model.toPath(model[item][0])
          };
        }
      } else if (typeof model[item] === 'object') {
        if (model[item].type) {
          // structured property e.g. author: { type: String }
          result[propName] = {
            path: propName,
            instance: model[item].type.name
          };
          if (model[item].maxLength) {
            result[propName].maxlengthValidator = () => {};
          }
        } else {
          const subSchema = Model.toPath(model[item], propName);

          result = {
            ...result,
            ...subSchema
          };
        }
      } else {
        result[propName] = {
          path: propName,
          instance: model[item].name
        };
      }
    });

    return result;
  }

  addData(data) {
    this._data = data.map(item => ({
      ...item,
      id: (this._count++).toString()
    }));

    return this._data;
  }

  create(data) {
    const newItem = {
      ...data,
      id: data.id || (this._count++).toString(),
      save: callback => {
        const result = this._data.find(item => item.id === newItem.id);

        if (result._id) {
          result.id = result._id;
        }
        callback();
      }
    };

    this._data.push(newItem);

    return newItem;
  }

  update(params, data, callback) {
    const item = this._data.find(item => item.id === params.id);

    if (item) {
      Object.keys(data).forEach(propName => {
        item[propName] = data[propName];
      });
      callback(undefined, item);
    } else {
      const error = new Error('Not found');

      error.status = 404;
      callback(error);
    }
  }

  exec(callback) {
    callback(null, this._data);
  }

  find() {
    return this;
  }

  findById(id, callback) {
    let idInternal = 0;

    switch (this.model.schema.id) {
      case Number:
        idInternal = +id;
        break;

      default:
        idInternal = id;
        break;
    }

    let result = this._data.find(item => item.id === idInternal);

    if (result) {
      result.save = (callback) => {
        callback();
      };
    }
    callback(null, result);
  }

  findByIdAndUpdate(id, data, callback) {
    const result = this._data.find(item => item.id === id);
    const index = this._data.indexOf(result);

    this._data[index] = {
      ...result,
      ...data
    };
    callback();

  }

  findOne(filter, callback) {
    const result = this._data.find(item => item.id === filter._id);
    callback(null, result);
  }

  remove(filter, callback) {
    const toDelete = this._data.find(item => item.id === filter._id);
    const deleteItem = item => {
      const index = this._data.indexOf(item);
      this._data.splice(index, 1);
    };

    if (toDelete) {
      if (Array.isArray(toDelete)) {
        toDelete.forEach(deleteItem);
        callback(null, JSON.stringify({ n: toDelete.length }));
      } else {
        deleteItem(toDelete);
        callback(null, JSON.stringify({ n: 1 }));
      }
    } else {
      callback(null, JSON.stringify({ n: 0 }));
    }
  }

  limit() {
    return this;
  }

  select() {
    return this;
  }

  skip() {
    return this;
  }

  sort() {
    return this;
  }

  where() {
    return this;
  }

  $where(value) {
    return this;
  }

  gt() {
    return this;
  }

  gte() {
    return this;
  }

  lt() {
    return this;
  }

  lte() {
    return this;
  }

  equals() {
    return this;
  }

  ne() {
    return this;
  }

  exists() {
    return this;
  }

  or() {
    return this;
  }

  and() {
    return this;
  }

  count(callback) {
    callback(null, this._data.length);
  }
}