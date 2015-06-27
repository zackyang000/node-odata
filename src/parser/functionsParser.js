"use strict";

// indexof(CompanyName,'X') eq 1
const indexof = (query, key, odataOperator, value) => {
  let target;
  [key, target] = key.substring(key.indexOf('(') + 1, key.indexOf(')')).split(',');
  [key, target] = [key.trim(), target.trim()];
  let operator = convertToOperator(odataOperator);
  query.$where(`this.${key}.indexOf(${target}) ${operator} ${value}`);
};

 // year(publish_date) eq 2000
const year = (query, key, odataOperator, value) => {
  key = key.substring(key.indexOf('(')+1, key.indexOf(')'));

  let start = new Date(+value, 0, 1);
  let end = new Date(+value + 1, 0, 1);

  switch(odataOperator) {
    case 'eq':
      query.where(key).gte(start).lt(end);
      break;
    case 'ne':
      var condition = [{}, {}];
      condition[0][key]= {$lt: start};
      condition[1][key]= {$gte: end};
      query.or(condition);
      break;
    case 'gt':
      query.where(key).gte(end);
      break;
    case 'ge':
      query.where(key).gte(start);
      break;
    case 'lt':
      query.where(key).lt(start);
      break;
    case 'le':
      query.where(key).lt(end);
      break;
  }
};

const convertToOperator = (odataOperator) => {
  let operator;
  switch(odataOperator) {
    case 'eq':
      operator = '==';
      break;
    case 'ne':
      operator = '!=';
      break;
    case 'gt':
      operator = '>';
      break;
    case 'ge':
      operator = '>=';
      break;
    case 'lt':
      operator = '<';
      break;
    case 'le':
      operator = '<=';
      break;
  }
  return operator;
};

export default { indexof, year };
