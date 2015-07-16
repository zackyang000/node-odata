"use strict";

import _ from 'lodash';
import { Router } from 'express';
import model from './../model';
import list from './list';
import post from './post';
import put from './put';
import del from './delete';
import get from './get';

const getRouter = (_conn, url, params, enableOdataSyntax) => {
  let options = params.options || {};
  let rest = params.rest || {};
  let actions = params.actions || {};

  let resourceURL = `/${url}`;
  let entityURL = `${resourceURL}\\(:id\\)`;

  let routes = [
    {
      method: 'post',
      url: resourceURL,
      controller: post,
      config: rest.post || {},
    },
    {
      method: 'put',
      url: entityURL,
      controller: put,
      config: rest.put || {},
    },
    {
      method: 'delete',
      url: entityURL,
      controller: del,
      config: rest.delete || rest.del || {},
    },
    {
      method: 'get',
      url: entityURL,
      controller: get,
      config: rest.get || {},
    },
    {
      method: 'get',
      url: resourceURL,
      controller: list,
      config: rest.list || {},
    },
  ];

  let mongooseModel = model.get(_conn, url);

  /*jshint -W064 */
  let router = Router();
  routes.map((route) => {
    router[route.method](route.url, (req, res, next) => {
      if (checkAuth(route.config.auth, req)) {
        //TODO: should run controller func after before done. [use app.post(url, auth, before, fn, after)]
        if (route.config.before) {
          if (route.method === 'post') {
            route.config.before(req.body, req, res);
          } if (route.method === 'get' && route.url === resourceURL) {
              route.config.before(req, res);
          } else {
            mongooseModel.findOne({ _id: req.params.id }, (err, entity) => {
              if (err) {
                return;
              }
              route.config.before(entity, req, res);
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
          if (route.config.after) {
            route.config.after(result.entity, result.originEntity, req, res);
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
      let fullUrl = `${entityURL}${actionUrl}`;
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
