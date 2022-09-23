export default class {
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
        }
      }
    };
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