"use strict";

import config from './config'

const register = ({ url, method, handle }) => {
  method = method.toLowerCase();
  const app = config.get('app');
  const prefix = config.get('prefix');

  app[method](`${prefix}${url}`, handle);
}

export default { register };
