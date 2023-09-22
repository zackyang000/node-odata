import MongoEntity from "./Entity";
import post from './rest/post';
import put from './rest/put';
import del from './rest/delete';
import getSingleton from "./rest/getSingleton";
import patchSingleton from "./rest/patchSingleton";

export default class MongoSingleton {
  constructor(name, model, annotations, mapping) {
    this.name = name;
    this.entity = new MongoEntity(name, model, annotations, mapping);

  }

  getHandler() {
    const rest = {
      post,
      put,
      patch: patchSingleton,
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