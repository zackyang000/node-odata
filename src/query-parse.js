import { min } from './utils';
import createError from 'http-errors';

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

  // TODO: NOT SUPPORT `OR` KEYWORDS FOR THIS VERSION.
  // $filter=Name eq 'John' and LastName lt 'Doe' -> [{ key: 'Name', operator: 'eq', value: 'John' }, { key: 'LastName', operator: 'let', value: 'Doe' }]
  ({ $filter }) => {
  },
]

function parseToInteger(count) {
  const number = +count;
  if (number > 0) {
    return Math.floor(number);
  }
}
