"use strict";

import _ from 'lodash'
import config from '../config'

// # ?$skip=10
// # ->
// # query.skip(10)
module.exports = function(query, skip, maxSkip) {
  var skip =  _.min([config.get('maxSkip'), maxSkip, skip]);
  if(skip < 0) {
    return;
  }
  query.skip(skip);
}
