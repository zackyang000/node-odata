import _ from 'lodash'
import config from '../config'
const SYSTEM_MAX_TOP = 1000000

// # ?$top=10
// # ->
// # query.top(10)
module.exports = function(query, top, maxTop) {
  var top =  _.min([SYSTEM_MAX_TOP, config.get('maxTop'), maxTop, top]);
  if(top < 0)
    top = SYSTEM_MAX_TOP;
  query.limit(top);
}
