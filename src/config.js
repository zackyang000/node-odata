"use strict";

import mongoose from 'mongoose'

const options = {
  app : undefined,  // app express instants
  db : undefined,   // mongoDB address
  prefix : '/oData',// api url prefix
  queryLimit: {
    maxTop: undefined,
    maxSkip: undefined,
  },
}

module.exports = {
  get: (key) => {
    return options[key];
  },

  set: (key, value) => {
    if (!value) {
      return undefined;
    }

    if (key == 'db') {
      if (options[key] == value) {
        return undefined;
      }
      if (options[key]) {
        throw new Error('db already set before, you can\'t set it twice.');
      }
      mongoose.connect(value);
    }

    options[key] = value;
  }
}
