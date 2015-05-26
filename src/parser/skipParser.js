"use strict";

import { min } from 'lodash'
import config from '../config'

// # ?$skip=10
// # ->
// # query.skip(10)
module.exports = (query, skip, maxSkip) => {
  skip =  min([config.get('maxSkip'), maxSkip, skip]);
  if(skip < 0) {
    return;
  }
  query.skip(skip);
}
