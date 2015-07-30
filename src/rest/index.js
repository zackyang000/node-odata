"use strict";

import http from 'http';
import { Router } from 'express';
import list from './list';
import post from './post';
import put from './put';
import del from './delete';
import get from './get';

const getRouter = (mongooseModel, { url, hooks, actions, options }) => {
  let resourceListURL = `/${url}`;
  let resourceURL = `${resourceListURL}\\(:id\\)`;

  let routes = [
    {
      method: 'post',
      url: resourceListURL,
      ctrl: post,
      hook: hooks.post,
    },
    {
      method: 'put',
      url: resourceURL,
      ctrl: put,
      hook: hooks.put,
    },
    {
      method: 'delete',
      url: resourceURL,
      ctrl: del,
      hook: hooks.delete,
    },
    {
      method: 'get',
      url: resourceURL,
      ctrl: get,
      hook: hooks.get,
    },
    {
      method: 'get',
      url: resourceListURL,
      ctrl: list,
      hook: hooks.list,
    },
  ];

  let router = Router();

  // add REST routes.
  routes.map((route) => {
    let { method, url, ctrl, hook } = route;
    router[method](url, (req, res, next) => {
      authorizePipe(req, res, hook.auth)
      .then(function() { return beforePipe(req, res, hook.before); })
      .then(function() { return ctrl(req, mongooseModel, options); })
      .then(function(result) { return respondPipe(req, res, result); })
      .then(function(data) { return afterPipe(req, res, hook.after, data); })
      .catch(function(result) { errorPipe(req, res, result); });
    });
  });

  // add ACTION routes.
  Object.keys(actions).map(function(url) {
    let action = actions[url];
    router.post(`${resourceURL}${url}`, (req, res, next) => {
      authorizePipe(req, res, action.auth).then(function() {
        action(req, res, next);
      }).catch(function(result) { errorPipe(req, res, result); });
    });
  });

  return router;
};

function authorizePipe(req, res, auth) {
  return new Promise((resolve, reject) => {
    if (auth !== undefined) {
      if (!auth(req, res)) {
        return reject({ status: 401 });
      }
    }
    resolve();
  });
}

function beforePipe(req, res, before) {
  return new Promise((resolve, reject) => {
    if (before) {
      before(req.body, req, res);
    }
    resolve();
  });
}

function respondPipe(req, res, result) {
  return new Promise((resolve, reject) => {
    let status = result.status || 200;
    let data = result.entity;
    res.status(status).jsonp(data);
    resolve(data);
  });
}

function afterPipe(req, res, after, data) {
  return new Promise((resolve, reject) => {
    if (after) {
      after(data, req.body, req, res);
    }
    resolve();
  });
}

function errorPipe(req, res, result) {
  return new Promise((resolve, reject) => {
    let status = result.status || 200;
    let text = result.text || http.STATUS_CODES[status];
    res.status(status).send(text);
  });
}

export default { getRouter };
