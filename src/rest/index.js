import http from 'http';
import { Router } from 'express';
import Adapter from '../db-adapter/mongodb';

function authorizePipe(req, res, auth) {
  return new Promise((resolve, reject) => {
    if (auth !== undefined) {
      if (!auth(req, res)) {
        return reject({ status: 401 });
      }
    }
    return resolve();
  });
}

function beforePipe(req, res, before) {
  return new Promise((resolve) => {
    if (before) {
      before(req.body, req, res);
    }
    resolve();
  });
}

function respondPipe(req, res, result) {
  return new Promise((resolve) => {
    const status = result.status || 200;
    const data = result.entity;
    res.status(status).jsonp(data);
    resolve(data);
  });
}

function afterPipe(req, res, after, data) {
  return new Promise((resolve) => {
    if (after) {
      after(data, req.body, req, res);
    }
    resolve();
  });
}

function errorPipe(req, res, err) {
  return new Promise(() => {
    const status = err.status || 500;
    const text = err.text || err.message || http.STATUS_CODES[status];
    res.status(status).send(text);
  });
}

function addRestRoutes(router, routes, mongooseModel, options) {
  return routes.map((route) => {
    const { method, url, ctrl, hook } = route;
    return router[method](url, (req, res) => {
      authorizePipe(req, res, hook.auth)
      .then(() => beforePipe(req, res, hook.before))
      .then(() => ctrl(req, mongooseModel))
      .then(result => respondPipe(req, res, result || {}))
      .then(data => afterPipe(req, res, hook.after, data))
      .catch(err => errorPipe(req, res, err));
    });
  });
}

function addActionRoutes(router, resourceURL, actions) {
  return Object.keys(actions).map((url) => {
    const action = actions[url];
    return router.post(`${resourceURL}${url}`, (req, res, next) => {
      authorizePipe(req, res, action.auth)
        .then(() => action(req, res, next))
        .catch(result => errorPipe(req, res, result));
    });
  });
}

const getRouter = (mongooseModel, { url, hooks, actions, options }) => {
  const resourceListURL = `/${url}`;
  const resourceURL = `${resourceListURL}\\(:id\\)`;

  const adapter = new Adapter(mongooseModel);

  const routes = [
    {
      method: 'post',
      url: resourceListURL,
      ctrl: (req) => adapter.create(req.body),
      hook: hooks.post,
    },
    {
      method: 'put',
      url: resourceURL,
      ctrl: (req) => adapter.update(req.params.id, req.body),
      hook: hooks.put,
    },
    {
      method: 'patch',
      url: resourceURL,
      ctrl: (req) => adapter.patch(req.params.id, req.body),
      config: hooks.patch,
    },
    {
      method: 'delete',
      url: resourceURL,
      ctrl: (req) => adapter.remove(req.params.id),
      hook: hooks.delete,
    },
    {
      method: 'get',
      url: resourceURL,
      ctrl: (req) => adapter.get(req.params.id),
      hook: hooks.get,
    },
    {
      method: 'get',
      url: resourceListURL,
      ctrl: (req) => adapter.list(req.query, options),
      hook: hooks.list,
    },
  ];

  /*eslint-disable */
  const router = Router();
  /*eslint-enable */
  addRestRoutes(router, routes, mongooseModel, options);
  addActionRoutes(router, resourceURL, actions);
  return router;
};

export default { getRouter };
