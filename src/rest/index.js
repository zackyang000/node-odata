"use strict";

import _ from 'lodash';
import { Router } from 'express';
import model from './../model';
import list from './list';
import post from './post';
import put from './put';
import del from './delete';
import get from './get';

const getRouter = (_conn, url, params) => {
  let hooks = params.hooks || {};
  let actions = params.actions || {};
  let options = params.options || {};

  let resourceListURL = `/${url}`;
  let resourceURL = `${resourceListURL}\\(:id\\)`;

  let routes = [
    {
      method: 'post',
      url: resourceListURL,
      controller: post,
      hooks: hooks.post || {},
    },
    {
      method: 'put',
      url: resourceURL,
      controller: put,
      hooks: hooks.put || {},
    },
    {
      method: 'delete',
      url: resourceURL,
      controller: del,
      hooks: hooks.delete || hooks.del || {},
    },
    {
      method: 'get',
      url: resourceURL,
      controller: get,
      hooks: hooks.get || {},
    },
    {
      method: 'get',
      url: resourceListURL,
      controller: list,
      hooks: hooks.list || {},
    },
  ];

  let mongooseModel = model.get(_conn, url);

  /*jshint -W064 */
  let router = Router();
  routes.map((route) => {
    router[route.method](route.url, (req, res, next) => {
      if (checkAuth(route.hooks.auth, req)) {
        //TODO: should run controller func after before done. [use app.post(url, auth, before, fn, after)]
        if (route.hooks.before) {
          if (route.method === 'post') {
            route.hooks.before(req.body, req, res);
          } else if (route.method === 'get' && route.url === resourceListURL) {
              route.hooks.before(req, res);
          } else {
            mongooseModel.findOne({ _id: req.params.id }, (err, entity) => {
              if (err) {
                return;
              }
              route.hooks.before(entity, req, res);
            });
          }
        }
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
          if (route.hooks.after) {
            route.hooks.after(result.entity, result.originEntity, req, res);
          }
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

  for(let actionUrl in actions) {
    let action = actions[actionUrl];
    ((actionUrl, action) => {
      let fullUrl = `${resourceURL}${actionUrl}`;
      router.post(fullUrl, (req, res, next) => {
        if(checkAuth(action.auth)) {
          action(req, res, next);
        }
        else {
          res.status(401).end();
        }
      });
    })(actionUrl, action);
  }

  return router;
};

const checkAuth = (auth, req) => {
  if (!auth) {
    return true;
  }
  return auth(req);
};

export default { getRouter };
