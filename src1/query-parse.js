import createError from 'http-errors';
import { min } from './utils';
import { COMPARISON_OPERATORS, LOGICAL_OPERATORS } from './query-parse-constants';
import { EQUALS, NOT_EQUALS, GREATER_THAN, GREATER_OR_EQUALS, LESSER_THAN, LESSER_OR_EQUALS } from './query-parse-constants';
import { AND } from './query-parse-constants';

/** @module parser */

/**
 * @typedef {Object} oDataQueryObject
 * @property {Number=} top
 *           a non-negative integer n that limits the number of items returned from a collection
 * @property {Number=} skip
 *           a non-negative integer n that excludes the first n items of the queried collection from the result
 * @property {Array.<string>=} select
 *           requests that the service return only the properties explicitly requested by the client
 * @property {Array.<Object>=} orderby
 *           specifies the order in which items are returned from the service
 * @property {string} orderby.field
 *           field name for order
 * @property {boolean} orderby.asc
 *           asc for ascending or desc for descending
 * @property {boolean=} count
 *           with a value of *true* specifies that the total count of items within a collection matching the request be returned along with the result
 * @property {Array.<Object>=} filter
 *           restricts the set of items returned
 * @property {string} filter.key
 *           the field name for filter
 * @property {string} filter.operator
 *           built-in filter operations
 * @property {string} filter.value
 *           the value for filter
 */

/**
 * Convert query string to OData format.
 *
 * @param {Object} query
 *        query object which be processed by query parser.
 * @param {string=} query.$top
 * @param {string=} query.$skip
 * @param {string=} query.$select
 * @param {string=} query.$orderby
 * @param {string=} query.$count
 * @param {string=} query.$filter
 * @param {Object=} options
 *        default oData query setting.
 * @param {string=} options.maxTop
 * @param {string=} options.maxSkip
 * @param {string=} options.defaultOrderBy
 * @return {oDataQueryObject}
 *         oData query object.
*/
export default function parse(query, options) {
}

const parser = [
  // $top=10 -> { top: 10 }
  ({ $top }, { maxTop }) => {
    let top = parseToInteger($top);

    // If there is no $top query, then no limit.
    if (top === undefined && maxTop === undefined) {
      return undefined;
    }

    // The maximum number of query is limited by the global limit
    const top = min(top, maxTop);

    return { top };
  },

  // $skip=10 -> { skip: 10 }
  ({ $skip }, { maxSkip }) => {
    let skip = parseToInteger($skip);

    // If there is no $skip query, then no limit.
    if (skip === undefined && maxTop === undefined) {
      return;
    }

    // The maximum number of skip is limited by the global limit
    const skip = min(top, maxSkip);

    return { skip };
  },

  // $select=Rating,ReleaseDate -> { select: ['Rating', 'ReleaseDate'] }
  ({ $select }) => {
    if (!$select) {
      return;
    }

    const select = $select.split(',').map(item => item.trim()).filter((item) => item);

    return { select };
  },

  // $orderby=ReleaseDate asc, Rating desc -> { orderby: [{ field: 'ReleaseDate', asc: true }, field: 'Rating', asc: false }] }
  ({ $orderby }, { defaultOrderBy }) => {
    const orderbyQuery = $orderby || defaultOrderBy;

    if (orderbyQuery === undefined) {
      return;
    }

    const orderby = orderbyQuery.split(',').map((item) => {
      const data = item.trim().split(' ');

      if (data.length > 2) {
        throw createError.BadRequest(`odata: Syntax error at '${$orderby}', it\'s should be like \'ReleaseDate asc, Rating desc\'`);
      }

      // If it is not `desc`, then all other words are default assigned to `asc`.
      return {
        field: data[0].trim(),
        asc: data[1] !== 'desc';
      };
    });

    return { orderby };
  },

  // $count=true -> { count: true }
  ({ $count }) => {
    if ($count === undefined) return;

    switch ($count) {
      case 'true': {
        return { count: true };
        break;
      }
      case 'false':
        return { count: false };
        break;
      default:
        throw createError.BadRequest('Unknown $count option, only "true" and "false" are supported.');
        break;
    }
  },

  // TODO: NOT SUPPORT `OR` AND `NOT` KEYWORDS FOR THIS VERSION.
  // $filter=Name eq 'John' and Price lt 30 -> [{ key: 'Name', operator: 'eq', value: 'John' }, { key: 'Price', operator: 'lt', value: 30 }]
  // $filter=indexof(description,'.NET') gt 0 -> [{ key: { func: 'indexof', key: 'description', value: '.NET' }, operator: 'gt', value: 0 }]
  // $filter=contains('Alfreds',CompanyName) -> [{ key: { func: 'contains', key: 'CompanyName', value: 'Alfreds' } }]
  ({ $filter }) => {
    if (!$filter) {
      return;
    }

    // Split multiple query conditions
    const condition = split($filter, LOGICAL_OPERATORS)
      .filter(item => (item !== AND));

    condition.map((item) => {
      // parse "indexof(title,'X1ML') gt 0"
      const conditionArr = split(item, OPERATORS_KEYS);
      if (conditionArr.length === 0) {
        // parse "contains(title,'X1ML')"
        conditionArr.push(item);
      }
      // length === 1 for `contains('Alfreds',CompanyName)`
      if (conditionArr.length !== 3 && conditionArr.length !== 1) {
        return reject(`Syntax error at '${item}'.`);
      }

      let key = conditionArr[0];
      const [, odataOperator, value] = conditionArr;

      if (key === 'id') key = '_id';

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
          return reject(`Syntax error at '${item}'.`);
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
            return reject("Incorrect operator at '#{item}'.");
        }
      }
      return undefined;
    });
    return resolve();
  },
]

function parseToInteger(count) {
  const number = +count;
  if (number > 0) {
    return Math.floor(number);
  }
}

function stringHelper {
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

function validator {
  formatValue: (value) => {
    let val;
    if (value === 'true') {
      val = true;
    } else if (value === 'false') {
      val = false;
    } else if (+value === +value) {
      val = +value;
    } else if (stringHelper.isBeginWith(value, "'") && stringHelper.isEndWith(value, "'")) {
      val = value.slice(1, -1);
    } else if (value === 'null') {
      val = value;
    } else {
      return ({ err: `Syntax error at '${value}'.` });
    }
    return ({ val });
  },
};
