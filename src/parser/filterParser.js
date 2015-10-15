"use strict";

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

export default (query, $filter) => {
  return new Promise((resolve, reject) => {
    if (!$filter) {
      return resolve();
    }

    const SPLIT_MULTIPLE_CONDITIONS = /(.+?)(?:and(?=(?:[^']*'[^']*')*[^']*$)|$)/g;
    const SPLIT_KEY_OPERATOR_AND_VALUE = /(.+?)(?: (?=(?:[^']*'[^']*')*[^']*$)|$)/g;

    let condition;
    if (stringHelper.has($filter, 'and')) {
      condition = $filter.match(SPLIT_MULTIPLE_CONDITIONS).map((s) => stringHelper.removeEndOf(s, 'and').trim());
    }
    else {
      condition = [ $filter.trim() ];
    }

    condition.map(function(item) {
      let conditionArr = item.match(SPLIT_KEY_OPERATOR_AND_VALUE).map((s) => s.trim()).filter((n) => n);
      if (conditionArr.length !== 3) {
        return reject(`Syntax error at '${item}'.`);
      }
      let [key, odataOperator, value] = conditionArr;

      let { val, err } = validator.formatValue(value);
      if (err) {
        return reject(err);
      }

      // function query
      let functionKey = key.substring(0, key.indexOf('('));
      if (functionKey in { indexof: 1, year: 1 }) {
        functions[functionKey](query, key, odataOperator, val);
      } else {
      // operator query
        switch(odataOperator) {
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
            return reject("Incorrect operator at '#{item}'.");
        }
      }
    });
    resolve();
  });
};

const stringHelper = {
  has : (str, key) => {
    return str.indexOf(key) >= 0;
  },

  isBeginWith : (str, key) => {
    return str.indexOf(key) === 0;
  },

  isEndWith : (str, key) => {
    return str.lastIndexOf(key) === (str.length - key.length);
  },

  removeEndOf : (str, key) => {
    if (stringHelper.isEndWith(str, key)) {
      return str.substr(0, str.length - key.length);
    }
    return str;
  },
};

const validator = {
  formatValue : (value) => {
    if (value === 'true') {
      value = true;
    } else if (value === 'false') {
      value = false;
    } else if (+value === +value) {
      value = +value;
    } else if (stringHelper.isBeginWith(value, "'") && stringHelper.isEndWith(value, "'")) {
      value = value.slice(1, -1);
    } else {
      return ({ err: `Syntax error at '${value}'.` });
    }
    return ({ val: value });
  }
};
