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
  if (!$filter) {
    return;
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

  for (let i = 0; i < condition.length; i++) {
    let item = condition[i];
    let conditionArr = item.match(SPLIT_KEY_OPERATOR_AND_VALUE).map((s) => s.trim()).filter((n) => n);
    if (conditionArr.length !== 3) {
      return new Error("Syntax error at '#{item}'.");
    }
    let [key, odataOperator, value] = conditionArr;
    value = validator.formatValue(value);

    // handle query-functions
    let queryFunctions = ['indexof', 'year'];
    for (let i = 0; i < queryFunctions.length; i++) {
      let queryFunction = queryFunctions[i];
      if (key.indexOf(`${queryFunction}(`) === 0) {
        functions[queryFunction](query, key, odataOperator, value);
        return;
      }
    }

    switch(odataOperator) {
      case 'eq':
        query.where(key).equals(value);
        break;
      case 'ne':
        query.where(key).ne(value);
        break;
      case 'gt':
        query.where(key).gt(value);
        break;
      case 'ge':
        query.where(key).gte(value);
        break;
      case 'lt':
        query.where(key).lt(value);
        break;
      case 'le':
        query.where(key).lte(value);
        break;
      default:
        return new Error("Incorrect operator at '#{item}'.");
    }
  }
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
      return true;
    }
    if (value === 'false') {
      return false;
    }
    if (+value === +value) {
      return +value;
    }
    if (stringHelper.isBeginWith(value, "'") && stringHelper.isEndWith(value, "'")) {
      return value.slice(1, -1);
    }
    return new Error(`Syntax error at '${value}'.`);
  }
};
