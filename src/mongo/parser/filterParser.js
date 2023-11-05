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

function parse($filter) {
  // returns a valid monggose filter object
  // odata functions are to be replaced
  if (!$filter) {
    return;
  }
  
  const keys = Object.keys($filter);

  keys.forEach(name => {
      if ($filter[name].$function) {
        const func = {
          ...functions[$filter[name].$function.$name](name, $filter[name].$function) 
        };
        
        $filter[name] = func;
      }

      // parsing rekursion
      if(Array.isArray($filter[name])) {
          $filter[name].forEach(subCondition => parse(subCondition));
      }

      if ($filter[name].eq === null) {
        $filter[name].$exists = false;
        delete $filter[name].eq;
      }

      if ($filter[name].ne === null) {
        $filter[name].$exists = true;
        delete $filter[name].ne;

      }

  });

  return $filter;

};

export default ($filter, $odata) => {
  let result = parse($filter);

  debugger;
  if ($odata.clientField) {
    const clientCondition = { [$odata.clientField]: { $eq: $odata.client } };

    result = result ? { $and: [ clientCondition, result ] } : clientCondition
  }

  return result;
};