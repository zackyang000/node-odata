"use strict";

import _ from 'lodash';
import config from './../config';
import model from './../model';
import post from './post';
import put from './put';
import del from './delete';
import { get, getAll } from './get';

const register = (params) => {
  const app = config.get('app');
  const prefix = config.get('prefix');

  let options = params.options || {};
  let rest = params.rest || {};
  let actions = params.actions || [];

  let resourceURL = `${prefix}/${params.url}`;
  let routes = [
    {
      method: 'post',
      url: `${resourceURL}`,
      controller: post,
      config: rest.post || rest.create || {},
    },
    {
      method: 'put',
      url: `${resourceURL}/:id`,
      controller: put,
      config: rest.put || rest.update || {},
    },
    {
      method: 'del',
      url: `${resourceURL}/:id`,
      controller: del,
      config: rest.delete || rest.del || {},
    },
    {
      method: 'get',
      url: `${resourceURL}/:id`,
      controller: get,
      config: rest.get || rest.read || {},
    },
    {
      method: 'get',
      url: `${resourceURL}`,
      controller: getAll,
      config: rest.getAll || rest.readAll || {},
    },
  ];

  let mongooseModel = model.get(params.url);

  routes.map((route) => {
    app[route.method](route.url, (req, res, next) => {
      if (checkAuth(route.config.auth, req)) {
        route.controller(req, mongooseModel, options).then((result = {}) => {
          res.status(result.status || 200);
          if (result.text) {
            res.send(result.text);
          }
          else if (result.entity) {
            res.jsonp(result.entity);
          }
          else {
            res.end();
          }
          route.config.after(result.entity, result.originEntity);
        }, (err) => {
          if (err.status) {
            res.status(err.status).send(err.text || '');
          }
          else {
            next(err);
          }
        });
      }
      else {
        res.status(401).end();
      }
    });
  });

  for(let url in actions) {
    let action = actions[url];
    ((url, action) => {
      app.post(`${resourceURL}/:id${url}`, (req, res, next) => {
        if(checkAuth(action.auth)) {
          action(req, res, next);
        }
      });
    })(url, action);
  }
};

const checkAuth = (auth, req) => {
  if (!auth) {
    return true;
  }
  return auth(req);
};

export default { register };
