"use strict";

import mongoose from 'mongoose'

var _options = {
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
    return _options[key]
  },

  set: (key, value) => {
    if(!value) {
      return undefined;
    }

    if(key == 'db') {
      if(_options[key] == value){
        return undefined;
      }
      if(_options[key]){
        throw new Error("db already set before, you can't set it twice.");
      }
      mongoose.connect(value);
    }

    _options[key] = value;
  }
}
