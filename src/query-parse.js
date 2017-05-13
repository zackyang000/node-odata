/** @module parser */

/**
 * @typedef {Object} oDataQueryObject
 * @property {Number=} top
 *           1
 * @property {Number=} skip
 *           1
 * @property {Array.<string>=} select
 *           1
 * @property {Object=} orderby
 * @property {string} orderby.field
 * @property {bool} orderby.asc
 *           1
 * @property {Number=} count
 *           1
 * @property {Array.<Object>=} filter
 * @property {key} filter.key
 * @property {key} filter.operator
 * @property {key} filter.value
 */

/**
 * Convert query string to OData format.
 *
 * @param {Object} query
 *        query object which be processed by query parser.
 * @param {string=} query.$top
 *        1
 * @param {string=} query.$skip
 *        1
 * @param {string=} query.$select
 *        1
 * @param {string=} query.$orderby
 *        1
 * @param {string=} query.$count
 *        1
 * @param {string=} query.$filter
 *        1
 * @param {Object=} options
 *        default oData query setting.
 * @param {string=} options.maxTop
 *        1
 * @param {string=} options.maxSkip
 *        1
 * @param {string=} options.defaultOrderBy
 *        1
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
