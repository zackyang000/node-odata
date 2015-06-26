"use strict";

import filterParser from './filterParser';

// ?$skip=10
// ->
// query.skip(10)
export default (resData, mongooseModel, $count, $filter) => {
  if (!$count) {
    return;
  }

  if ($count === 'true') {
    const query = mongooseModel.find();
    filterParser(query, $filter);
    query.count((err, count) => {
      resData['@odata.count'] = count;
    });
  }
  else if ($count == 'false') {
    return;
  }
  else {
    return new Error('Unknown $count option, only "true" and "false" are supported.');
  }
};
