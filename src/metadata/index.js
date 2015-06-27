"use strict";

import config from './../config';
import parser from './parser';

const entities = new Map();

let isBootstrap = false;

const register = ({url, model}) => {
  entities.set(url, parser.toMetadata(model));

  if (!isBootstrap) {
    isBootstrap = true;

    const app = config.get('app');
    const prefix = config.get('prefix');

    app.get(prefix || '/', (req, res, next) => {
      const resources = {};
      for (let [key, value] of entities) {
        resources[key] = value;
      }
      res.json({ resources });
    });
  }
};

export default { register };
