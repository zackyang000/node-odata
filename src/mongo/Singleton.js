import MongoEntity from "./Entity";
import post from './rest/post';
import put from './rest/put';
import del from './rest/delete';
import patch from './rest/patch';
import getSingleton from "./rest/getSingleton";

export default class MongoSingleton {
  constructor(name, model) {
    this.name = name;
    this.entity = new MongoEntity(name, model);

  }

  getHandler() {
    const rest = {
      post,
      put,
      patch,
      delete: del,
      get: getSingleton
    };
    const routes = Object.keys(rest);
    let handler = {};

    routes.forEach((route) => {
      handler[route] = async (req, res, next) => {
        try {
          req.$odata = {
            ...req.$odata,
            Model: this.entity.model
          };
          await rest[route](req, res, next);

        } catch (err) {
          next(err);
        }
      };
    });

    return handler;
  }

}