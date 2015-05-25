"use strict";

import config from './config'

module.exports = {
  register: ({ url, method, handle }) => {
    method = method.toLowerCase();
    let app = config.get('app');
    let prefix = config.get('prefix');

    app[method](`${prefix}${url}`, handle);
  }
}
