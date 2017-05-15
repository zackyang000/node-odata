/** @module parser */

/**
 * @typedef {Object} oDataQueryObject
 * @property {Number=} top
 *           a non-negative integer n that limits the number of items returned from a collection
 * @property {Number=} skip
 *           a non-negative integer n that excludes the first n items of the queried collection from the result
 * @property {Array.<string>=} select
 *           requests that the service return only the properties explicitly requested by the client
 * @property {Object=} orderby
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
  const { $top, $skip, $select, $orderby, $count, $filter } = query;
  const result = {};
  result.top = parseTop(query.$top);
}

function parseCount(count) {
  const number = +count;
  if (number > 0) {
    return Math.floor(number);
  }
}
