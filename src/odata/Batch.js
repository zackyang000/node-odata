import { Router } from 'express';
import error from '../middlewares/error';
import { STATUS_CODES } from 'http';

export default class Batch {
  constructor(server) {
    this._server = server;
    this._url = '/\\$batch';
  }

  post() {
    return this;
  }

  middleware = async (req, res, next) => {
    try {
      res.$odata.result = await this.ctrl(req, res, error => {
        if (error instanceof Error) {
          throw error;
        }
      });
      res.$odata.supportedMimetypes = ['multipart/mixed', 'application/json'];
      res.$odata.status = 200;

      next();

    } catch (err) {
      next(err);
    }
  };

  match(method, url) {
    if (method === 'post'
      && url === url.indexOf(this._url.replace(/\\/g, '') === 0)) {
      return this.middleware;
    }
    return undefined;
  }

  _router() {
    /*eslint-disable */
    const router = Router();
    /* eslint-enable */
    router.post(this._url, this.middleware);

    return router;
  }

  static mapToQuery(url) {
    const match = url.match(/\?([^#]+)/);

    if (!match || !match.length) {
      return {};
    }

    const queryString = match[1];
    const parameters = queryString.split('&').map((parameter) => {
      const keyValue = parameter.split('=');
      const result = {
        key: decodeURIComponent(keyValue[0]),
      };

      if (keyValue.length > 1) {
        result.value = decodeURIComponent(keyValue[1]);
      }
      return result;
    });

    return parameters.filter((parameter) => parameter.value)
      .reduce((previous, current) => {
        const result = {
          ...previous,
        };

        result[current.key] = current.value;

        return result;
      }, {});
  }

  async executeSingleRequest(handler, req, res) {
    try {
      let promise = null;

      for (let i = 0; i < this._server.hooks.before.length; ++i) {
        const hook = this._server.hooks.before[i];

        if (promise) {
          promise = promise.then(() => {
            return hook(req, res, err => {
              if (err) {
                throw err;
              }
            });
          });
        } else {
          promise = hook(req, res, err => {
            if (err) {
              throw err;
            }
          });
        }
        
      }

      for (let i = 0; i < handler.length; ++i) {
        const handlerOrHook = handler[i];

        if (promise) {
          promise = promise.then(() => {
            return handlerOrHook(req, res, err => {
              if (err) {
                throw err;
              }
            });
          });
        } else {
          promise = handlerOrHook(req, res, err => {
            if (err) {
              throw err;
            }
          });
        }
      }

      for(let i = 0; i < this._server.hooks.after.length; ++i) {
        const hook = this._server.hooks.after[i];

        if (hook !== error) {
          if (promise) {
            promise = promise.then(() => {
              return hook(req, res, err => {
                if (err) {
                  throw err;
                }
              });
            });
          } else {
            promise = hook(req, res, err => {
              if (err) {
                throw err;
              }
            });
          }
        }
      }

      await promise;

    } catch (err) {
      error(err, req, res);
    }
  }

  async ctrl(req, res, next) {
    const responses = req.body.requests.map(async function (request) {
      const handler = Object.keys(this._server.resources)
        .map((name) => this._server.resources[name].match(request.method, request.url))
        .concat(Object.keys(this._server.actions)
          .map(name => this._server.actions[name].match(request.method, request.url)))
        .find((ctrl) => ctrl);
      let result = {
      };
      if (request.id) {
        result.id = request.id;
      }
      const currentRequest = {
        headers: request.headers || {},
        method: request.method,
        query: Batch.mapToQuery(request.url),
        body: request.body,
        $odata: res.$odata
      };

      const paramsMatch = request.url.match(/^\/?[^#?(]+\('(\w+)'\)/);

      if (paramsMatch && paramsMatch.length > 1) {
        currentRequest.params = {
          id: paramsMatch[1],
        };
      }

      if (!handler) {
        result.status = 404;
        result.statusText = STATUS_CODES[404];
        result.body = STATUS_CODES[404];
      } else {
        function appendHeader(name, value) {
          if (!result.headers) {
            result.headers = {
              'OData-Version': '4.0'
            };
          }
          result.headers[name] = value;
        }

        function jsonp(body) {
          result.body = body;
          appendHeader('content-type', 'application/json');
        };

        const currentResponse = {
          end: (message) => { throw new Error(message); },
          type: (mimetype) => {
            appendHeader('content-type', mimetype);
          },
          setHeader: appendHeader,
          jsonp,
          status: (status) => {
            result.status = status;
            result.statusText = STATUS_CODES[status];

            return {
              jsonp,
              end: () => { },
              send: (body) => {
                result.body = body;
              }
            };
          }
        };

        await this.executeSingleRequest(handler, currentRequest, currentResponse);

      }
      return result;
    }.bind(this));

    return Promise.all(responses).then((results) => {
      return {
        responses: results
      };
    });
  }
}
