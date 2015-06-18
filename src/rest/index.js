"use strict";

import _ from 'lodash';
import { Router } from 'express';
import model from './../model';
import post from './post';
import put from './put';
import del from './delete';
import { get, getAll } from './get';

const getRouter = (params, enableOdataSyntax) => {
  let options = params.options || {};
  let rest = params.rest || {};
  let actions = params.actions || [];

  let resourceURL = `/${params.url}`;

  let getUrl = `${resourceURL}/:id`;
  if (enableOdataSyntax) {
    getUrl = `${resourceURL}(:id)`;
  }

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
      method: 'delete',
      url: `${resourceURL}/:id`,
      controller: del,
      config: rest.delete || rest.del || {},
    },
    {
      method: 'get',
      url: getUrl,
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

  let router = Router();
  routes.map((route) => {
    router[route.method](route.url, (req, res, next) => {
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
        }
        , (err) => {
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
      router.post(`${resourceURL}/:id${url}`, (req, res, next) => {
        if(checkAuth(action.auth)) {
          action(req, res, next);
        }
      });
    })(url, action);
  }

  return router;
}

const checkAuth = (auth, req) => {
  if (!auth) {
    return true;
  }
  return auth(req);
};

export default { getRouter };
