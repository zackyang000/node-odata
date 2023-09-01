import parseValue from '../parser/value';
import parseProperty from './property';
import validateProperty from '../validators/property';

export default function (req, entity, metadata, mapping) {
  const funcRegex = /(contains|indexof|year)\s*\(\s*([^,]+)\s*[,]?\s*([^)]*)\)\s*(eq|ne|gt|ge|lt|le)?\s*([0-9]*)/i;

  const replaceString = (filter, dictionary) => {
    const replacer = (match, p1) => {
      const result = `$${dictionary.length}`;

      dictionary[result] = p1;
      return result;
    };

    if (filter.search(/'[^']*'/) === -1) {
      return visitor('splitOr', filter, dictionary);

    }

    const replacedFilter = filter.replace(/'([^']*)'/g, replacer);

    return visitor('splitOr', replacedFilter, dictionary);

  };

  const splitOr = (filter, dictionary) => {
    const result = {
      $or: []
    };

    if (filter.search(/\s+or\s+/i) === -1) {
      return visitor('splitAnd', filter, dictionary);
    }

    const subConditions = filter.split(/\s+or\s+/i);

    subConditions.forEach(item => {
      result.$or.push(visitor('splitAnd', item, dictionary));
    });

    return result;
  };

  const splitAnd = (filter, dictionary) => {
    const result = [];

    if (filter.search(/\s+and\s+/i) === -1) {
      return visitor('splitCondition', filter, dictionary);
    }

    const subConditions = filter.split(/\s+and\s+/i);

    subConditions.forEach(item => {
      const newCondition = visitor('splitCondition', item, dictionary);
      const properties = Object.keys(newCondition);
      const oldCondition = result.find(item => 
        properties.find(name => item[name]));
      const sameProperty = properties.find(name => oldCondition && oldCondition[name]);
      
        if (oldCondition) {
          oldCondition[sameProperty] = {
            ...oldCondition[sameProperty],
            ...newCondition[sameProperty]
          };
        } else {
          result.push(newCondition);
        }
    });

    return result.length > 1 ? { $and: result } : result[0];
  };

  const splitCondition = (filter, dictionary) => {
    const operatorIndex = filter.search(/\s+(eq|ne|gt|ge|lt|le)\s+/i);

    if (filter.match(funcRegex)) {
      return visitor('parseFunction', filter, dictionary);
    }

    const operands = filter.split(/\s+(eq|ne|gt|ge|lt|le)\s+/i);

    if (operands?.length != 3) {
      const err = new Error(`Two operands and one operator was expected in '${filter}'`);

      err.status = 400;
      throw err;
    }
    let operator;
    const operatorPrettified = operands[1].trim().toLowerCase();

    switch (operatorPrettified) {
      case 'eq':
      case 'ne':
      case 'gt':
      case 'lt':
        operator = `$${operatorPrettified}`;
        break;

      case 'ge':
        operator = '$gte';
        break;

      case 'le':
        operator = '$lte';
        break;

      default:
        throw new Error(`Unexpected operator '${operatorPrettified}' in '${$filter}'`);
    }

    const property = parseProperty(operands[0], mapping);
    const value = operands[2].trim();

    return {
      [property]: {
        [operator]: parseValue(dictionary[value] || value, validateProperty(operands[0].trim(), req, entity, metadata))
      }
    };
  };

  const parseFunction = (filter, dictionary) => {
    // contains(CompanyName,'freds')
    // indexof(CompanyName,'lfreds') eq 1
    // year(BirthDate) eq 0
    const match = filter.match(funcRegex);

    if (!match) {
      const err = new Error(`Text '${filter}' can not be interpreted`);

      err.status = 400;
      throw err;
    }

    const func = match[1].toLowerCase();
    const property = parseProperty(match[2], mapping);
    const parameter = match[3] && dictionary[match[3]] ? dictionary[match[3]] : match[3];

    // 0	indexof(CompanyName,$0) eq 10
    // 1	indexof
    // 2	CompanyName
    // 3	$0
    // 4	eq
    // 5	10

    // 0	year(BirthDate) eq 0
    // 1	year
    // 2	BirthDate
    // 3	
    // 4	eq
    // 5	0

    return {
      [property]: {
        $function: {
          $name: func,
          $parameter: parameter,
          $operator: match[4],
          $value: match[5] || undefined
        }
      }
    };
  };

  const visitor = (step, filter, dictionary) => {
    if (!filter || !filter.trim()) {
      return undefined;
    }

    switch (step) {
      case 'parseFunction':
        return parseFunction(filter, dictionary);

      case 'replaceStrings':
        return replaceString(filter, []);

      case 'splitAnd':
        return splitAnd(filter, dictionary);

      case 'splitCondition':
        return splitCondition(filter, dictionary);

      case 'splitOr':
        return splitOr(filter, dictionary);

      default:
        throw new Error(`Step '${step}' not implemented`);
    }
  };

  return visitor('replaceStrings', req.query.$filter);

}