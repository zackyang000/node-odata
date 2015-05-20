import _ from 'lodash';
import config from './../config';
import model from './../model';

module.exports = {
    register: function(params) {
      var app = config.get('app')
      var prefix = config.get('prefix')

      var options = params.options || {}
      var rest = params.rest || {}
      var actions = params.actions || []

      var resourceURL = `${prefix}/${params.url}`
      var routes = [
        {
          method: 'post',
          url: `${resourceURL}`,
          controller: require('./post'),
          config: rest.post || rest.create || {},
        },
        {
          method: 'put',
          url: `${resourceURL}/:id`,
          controller: require('./put'),
          config: rest.put || rest.update || {},
        },
        {
          method: 'del',
          url: `${resourceURL}/:id`,
          controller: require('./delete'),
          config: rest.delete || rest.del || {},
        },
        {
          method: 'get',
          url: `${resourceURL}/:id`,
          controller: require('./get').get,
          config: rest.get || rest.read || {},
        },
        {
          method: 'get',
          url: `${resourceURL}`,
          controller: require('./get').getAll,
          config: rest.getAll || rest.readAll || {},
        },
      ];

      var mongooseModel = model.get(params.url);

      routes.map(function(route) {
        app[route.method](route.url, function(req, res, next) {
          if(checkAuth(route.config.auth, req)) {
            route.controller(req, mongooseModel, options).then(function(result = {}) {
              res.status(result.status || 200);
              if(result.text)
                res.send(result.text);
              else if(result.entity)
                res.jsonp(result.entity);
              else
                res.end();
              route.config.after(result.entity, result.originEntity);
            }
            , function(err) {
              if(err.status)
                res.status(err.status).send(err.text || '');
              else
                next(err);
            });
          }
          else {
            res.status(401).end();
          }
        });
      });

      for(var url in actions) {
        var action = actions[url];
        (function(url, action) {
          app.post(`${resourceURL}/:id${url}`, function(req, res, next) {
            if(checkAuth(action.auth))
              action(req, res, next);
          });
        })(url, action);
      }
    }
}

var checkAuth = function(auth, req) {
  if(!auth)
    return true;
  return auth(req);
};
