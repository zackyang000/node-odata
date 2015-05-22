module.exports = {
  // indexof(CompanyName,'X') eq 1
  indexof: function(query, key, odataOperator, value) {
    var [key, target] = key.substring(key.indexOf('(') + 1, key.indexOf(')')).split(',');
    [key, target] = [key.trim(), target.trim()];

    var operator = convertToOperator(odataOperator)
    query.$where(`this.${key}.indexOf(${target}) ${operator} ${value}`);
  },

   // year(publish_date) eq 2000
  year: function(query, key, odataOperator, value) {
    var key = key.substring(key.indexOf('(')+1, key.indexOf(')'));

    var start = new Date(+value, 0, 1);
    var end = new Date(+value + 1, 0, 1);

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
  }
}


var convertToOperator = function(odataOperator) {
  var operator = undefined;
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
  return operator
}
