import { Router } from 'express';
import pipes from '../pipes';
import MimetypeParser from '../parser/mimetypeParser';
import { STATUS_CODES } from 'http';

export default class Batch {
  constructor(server) {
    this._server = server;
    this._hooks = {
    };
    this._url = '/\\$batch';
  }

  post() {
    return this;
  }

  before(fn) {
    this._hooks.before = fn;
    return this;
  }

  after(fn) {
    this._hooks.after = fn;
    return this;
  }

  auth(fn) {
    this._hooks.auth = fn;
    return this;
  }

  middleware = async (req, res) => {
    try {
      await pipes.authorizePipe(req, res, this._hooks.auth);
      await pipes.beforePipe(req, res, this._hooks.before);

      const result = await this.ctrl(req);
      const data = await pipes.respondPipe(req, res, result || {});

      pipes.afterPipe(req, res, this._hooks.after, data);
    } catch (err) {
      pipes.errorPipe(req, res, err);
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

  async ctrl(req) {
    const responses = req.body.requests.map(async function (request) {
      const handler = Object.keys(this._server.resources)
        .map((name) => this._server.resources[name].match(request.method, request.url))
        .find((ctrl) => ctrl);
      let result = {
      };
      if (request.id) {
        result.id = request.id;
      }
      const currentRequest = {
        headers: request.headers,
        query: Batch.mapToQuery(request.url),
        body: request.body,
      };

      const paramsMatch = request.url.match(/^\/[^#?(]+\('(\w+)'\)/);

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
            result.headers = {};
          }
          result.headers[name] = value;
        }
        await handler(currentRequest, {
          type: (mimetype) => {
            appendHeader('content-type', mimetype);
          },
          setHeader: appendHeader,
          status: (status) => {
            result.status = status;
            result.statusText = STATUS_CODES[status];

            return {
              jsonp: (body) => {
                result.body = body;
              },
              end: () => { },
            };
          },
        });
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
