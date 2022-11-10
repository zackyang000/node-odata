export default class {
  writeJson(res, data, status, resolve) {
    let normalizedData = data.entity;

    if (data.entity) {
      if (data.entity.toObject) {
        normalizedData = data.entity.toObject();
      } else if (Array.isArray(data.entity.value)) {
        normalizedData = {
          value: data.entity.value.map((item) => {
            const result = item.toObject ? item.toObject() : item;

            return result;
          }),
          '@odata.count': data.entity['@odata.count'],
        };
      } else if (data.entity.value) {
        normalizedData = {
          value: data.entity.value.toObject ? data.entity.value.toObject() : data.entity.value,
        };
      }
      normalizedData = this.replaceDot(normalizedData);
    } else if (data.responses) {
      normalizedData = data;
    } else {
      normalizedData = data.metadata || data.serviceDocument;
    }

    res.type('application/json');
    res.status(status).jsonp(normalizedData);
    resolve(normalizedData);
  }

  replaceDot(value) {
    if (!(value === null || value === undefined || typeof value === 'function')) {
      if (Array.isArray(value)) {
        return this.replaceDotinArray(value);
      }
      if (typeof value === 'object') {
        return this.replaceObject(value);
      }
    }

    return value;
  }

  replaceDotinArray(array) {
    const result = array;

    result.forEach((item, index) => {
      result[index] = this.replaceDot(item);
    });
    return result;
  }

  replaceObject(obj) {
    const result = obj;

    Object.keys(result).forEach((item) => {
      if (item.match(/^[^@][^.]+(\.[^.]+)+/)) {
        const newPropertyName = item.replace('.', '-');

        result[newPropertyName] = this.replaceDot(result[item]);
        delete result[item];
      } else {
        result[item] = this.replaceDot(result[item]);
      }
    });

    return result;
  }
}
