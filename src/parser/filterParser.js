// Operator  Description             Example
// Comparison Operators
// eq        Equal                   Address/City eq 'Redmond'
// ne        Not equal               Address/City ne 'London'
// gt        Greater than            Price gt 20
// ge        Greater than or equal   Price ge 10
// lt        Less than               Price lt 20
// le        Less than or equal      Price le 100
// has       Has flags               Style has Sales.Color'Yellow'    #todo
// Logical Operators
// and       Logical and             Price le 200 and Price gt 3.5
// or        Logical or              Price le 3.5 or Price gt 200     #todo
// not       Logical negation        not endswith(Description,'milk') #todo

// eg.
//   http://host/service/Products?$filter=Price lt 10.00
//   http://host/service/Categories?$filter=Products/$count lt 10

import functions from './functionsParser';
import { split } from '../utils';

const OPERATORS_KEYS = ['eq', 'ne', 'gt', 'ge', 'lt', 'le', 'has'];

const stringHelper = {
  has: (str, key) => str.indexOf(key) >= 0,

  isBeginWith: (str, key) => str.indexOf(key) === 0,

  isEndWith: (str, key) => str.lastIndexOf(key) === (str.length - key.length),

  removeEndOf: (str, key) => {
    if (stringHelper.isEndWith(str, key)) {
      return str.substr(0, str.length - key.length);
    }
    return str;
  },
};

class KeyParser {
  constructor(model) {
    this._model = model;
  }

  getConvertedKey(input) {
    let key = input;

    if (key === 'id') {
      key = '_id';
      return key;
    }
    if (this._model[key]) {
      // known simple property
      return key;
    }

    const match = key.match(/\s*(contains|indexof|year)\(\s*([\w+-]+)/);

    if (match) {
      // contains function was called with id e.g. contains(title, 'ggm')
      const functionKey = match[2];

      key = key.replace(functionKey, this.getConvertedKey(functionKey));
    } else {
      key = Object.keys(this._model.model.schema.paths).find((item) => {
        const replacedDots = item.replace(/\./g, '(.|-){1}');
        const regex = new RegExp(`^${replacedDots}$`);

        return key.match(regex);
      });
      if (!key) {
        const error = new Error(`Unknown property '${this._input}' in entity '${this._model.name}'`);

        error.status = '400';
        throw error;
      }
    }
    return key;
  }
}

const validator = {
  formatValue: (value) => {
    let val;
    if (value === 'true') {
      val = true;
    } else if (value === 'false') {
      val = false;
    } else if (!Number.isNaN(+value)) {
      val = +value;
    } else if (stringHelper.isBeginWith(value, "'") && stringHelper.isEndWith(value, "'")) {
      val = value.slice(1, -1);
    } else if (value === 'null') {
      val = value;
    } else {
      return ({ err: new Error(`Syntax error at '${value}'.`) });
    }
    return ({ val });
  },
};

export default (query, $filter, model) => new Promise((resolve, reject) => {
  if (!$filter) {
    resolve();
    return;
  }

  try {
    const condition = split($filter, ['and', 'or'])
      .filter((item) => (item !== 'and' && item !== 'or'));

    condition.forEach((item) => {
      // parse "indexof(title,'X1ML') gt 0"
      const conditionArr = split(item, OPERATORS_KEYS);
      if (conditionArr.length === 0) {
        // parse "contains(title,'X1ML')"
        conditionArr.push(item);
      }
      if (conditionArr.length !== 3 && conditionArr.length !== 1) {
        throw new Error(`Syntax error at '${item}'.`);
      }

      const keyParser = new KeyParser(model);
      let key = conditionArr[0];
      const [, odataOperator, value] = conditionArr;

      key = keyParser.getConvertedKey(key);

      let val;
      if (value !== undefined) {
        const result = validator.formatValue(value);
        if (result.err) {
          return reject(result.err);
        }
        val = result.val;
      }

      // function query
      const functionKey = key.substring(0, key.indexOf('('));
      if (['indexof', 'year', 'contains'].indexOf(functionKey) > -1) {
        functions[functionKey](query, key, odataOperator, val);
      } else {
        if (conditionArr.length === 1) {
          return reject(new Error(`Syntax error at '${item}'.`));
        }
        if (value === 'null') {
          switch (odataOperator) {
            case 'eq':
              query.exists(key, false);
              return resolve();
            case 'ne':
              query.exists(key, true);
              return resolve();
            default:
              break;
          }
        }
        // operator query
        switch (odataOperator) {
          case 'eq':
            query.where(key).equals(val);
            break;
          case 'ne':
            query.where(key).ne(val);
            break;
          case 'gt':
            query.where(key).gt(val);
            break;
          case 'ge':
            query.where(key).gte(val);
            break;
          case 'lt':
            query.where(key).lt(val);
            break;
          case 'le':
            query.where(key).lte(val);
            break;
          default:
            return reject(new Error("Incorrect operator at '#{item}'."));
        }
      }
      return query;
    });
    resolve();
  } catch (error) {
    reject(error);
  }
});
