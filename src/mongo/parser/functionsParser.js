const convertToOperator = (odataOperator) => {
  let operator;
  switch (odataOperator) {
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
    default:
      throw new Error('Invalid operator code, expected one of ["==", "!=", ">", ">=", "<", "<="].');
  }
  return operator;
};

// contains(CompanyName,'icrosoft')
const contains = (name, $filter) => ({
  $where: `this.${name}.indexOf(${$filter.$parameter}) != -1`
});

// indexof(CompanyName,'X') eq 1
const indexof = (name, $filter) => {
  const { $parameter, $operator, $value } = $filter;
  const operator = convertToOperator($operator);

  return {
    $where: `this.${name}.indexOf(${$parameter}) ${operator} ${$value}`
  };
};

// year(publish_date) eq 2000
const year = (name, $filter) => {
  const result = {};
  const { $value, $operator } = $filter;

  const start = new Date(+$value, 0, 1);
  const end = new Date(+$value + 1, 0, 1);

  switch ($operator) {
    case 'eq':
      result.$gte = start;
      result.$lt = end;
      break;
    case 'ne': {
      result = {
        $or: [{
          $lt: start
        }, {
          $gte: end
        }]
      } ;
      break;
    }
    case 'gt':
      result.$gte = end;
      break;
    case 'ge':
      result.$gte = start;
      break;
    case 'lt':
      result.$lt = start;
      break;
    case 'le':
      result.$lt = end;
      break;
    default:
      throw new Error('Invalid operator code, expected one of ["==", "!=", ">", ">=", "<", "<="].');
  }

  return result;
};

export default { indexof, year, contains };
