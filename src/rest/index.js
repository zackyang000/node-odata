import { Router } from 'express';
import list from './list';
import post from './post';
import put from './put';
import del from './delete';
import patch from './patch';
import get from './get';
import pipes from '../pipes';
import count from './count';

const getRoutes = (url, hooks) => {
  const resourceListURL = `/${url}`;
  const resourceListRegex = new RegExp(`(^\/?${url}[?#])|(^\/?${url}$)`);
  const resourceURL = `${resourceListURL}\\(:id\\)`;
  const resourceRegex = new RegExp(`^\/?${url}\\([^)]+\\)`);

  return [
    {
      method: 'post',
      url: resourceListURL,
      regex: resourceListRegex,
      ctrl: post,
      hook: hooks.post,
    },
    {
      method: 'put',
      url: resourceURL,
      regex: resourceRegex,
      ctrl: put,
      hook: hooks.put,
    },
    {
      method: 'patch',
      url: resourceURL,
      regex: resourceRegex,
      ctrl: patch,
      hook: hooks.patch,
    },
    {
      method: 'delete',
      url: resourceURL,
      regex: resourceRegex,
      ctrl: del,
      hook: hooks.delete,
    },
    {
      method: 'get',
      url: resourceURL,
      regex: resourceRegex,
      ctrl: get,
      hook: hooks.get,
    },
    {
      method: 'get',
      url: resourceListURL + '/([\$])count',
      regex: new RegExp(`(^\/?${url}\/\\$count[?]?)|(^\/?${url}\/\\$count$)`),
      ctrl: count,
      hook: hooks.count,
    },
    {
      method: 'get',
      url: resourceListURL,
      regex: resourceListRegex,
      ctrl: list,
      hook: hooks.list,
    }
  ];
};

const getMiddlewares = (url, hooks, mongooseModel, options) => {
  const routes = getRoutes(url, hooks);

  return routes.map((route) => {
    const {
      ctrl, hook,
    } = route;

    const middleware = async (req, res) => {
      try {
        await pipes.authorizePipe(req, res, hook.auth);
        await pipes.beforePipe(req, res, hook.before);

        const result = await ctrl(req, mongooseModel, options);
        const data = await pipes.respondPipe(req, res, result || {});

        pipes.afterPipe(req, res, hook.after, data);

      } catch (err) {
        pipes.errorPipe(req, res, err);
      }
    };

    return {
      ...route,
      middleware
    };
  });
};

const getRouter = (mongooseModel, { url, hooks, options }) => {
  const routes = getMiddlewares(url, hooks, mongooseModel, options);
  /*eslint-disable */
  const router = Router();
  /* eslint-enable */

  routes.forEach((route) => {
    const {
      method, middleware,
    } = route;
    router[method](route.url, middleware);
  });
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

export default { getRouter, getMiddlewares, getOperationRouter };
