"use strict";

import config from './../config';
import parser from './parser';

const entities = new Map();

let isBootstrap = false;

module.exports = {
  register: ({url, model}) => {
    entities.set(url, parser.toMetadata(model));

    if (!isBootstrap) {
      isBootstrap = true;

      const app = config.get('app');
      const prefix = config.get('prefix');

      app.get(prefix || '/', (req, res, next) => {
        res.json({resources: [...entities.entries()]});
      });
    }
  }
}
