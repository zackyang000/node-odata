import { Router } from 'express';
import list from './list';
import post from './post';
import put from './put';
import del from './delete';
import patch from './patch';
import get from './get';
import pipes from '../pipes';

function addRestRoutes(router, routes, mongooseModel, options) {
  return routes.map((route) => {
    const {
      method, url, ctrl, hook,
    } = route;
    return router[method](url, (req, res) => {
      pipes.authorizePipe(req, res, hook.auth)
        .then(() => pipes.beforePipe(req, res, hook.before))
        .then(() => ctrl(req, mongooseModel, options))
        .then((result) => pipes.respondPipe(req, res, result || {}))
        .then((data) => pipes.afterPipe(req, res, hook.after, data))
        .catch((err) => pipes.errorPipe(req, res, err));
    });
  });
}

const getRouter = (mongooseModel, { url, hooks, options }) => {
  const resourceListURL = `/${url}`;
  const resourceURL = `${resourceListURL}\\(:id\\)`;

  const routes = [
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
      method: 'patch',
      url: resourceURL,
      controller: patch,
      config: hooks.patch,
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

  /*eslint-disable */
  const router = Router();
  /* eslint-enable */
  addRestRoutes(router, routes, mongooseModel, options);
  return router;
};

const getOperationRouter = (resourceUrl, actionUrl, fn, auth) => {
  /*eslint-disable */
  const router = Router();
  /* eslint-enable */

  router.post(`${resourceUrl}${actionUrl}`, (req, res, next) => {
    pipes.authorizePipe(req, res, auth)
      .then(() => fn(req, res, next))
      .catch((result) => pipes.errorPipe(req, res, result));
  });

  return router;
};

export default { getRouter, getOperationRouter };
