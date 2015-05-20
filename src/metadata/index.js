import config from './../config';
import parser from './parser';

entities = {}

register = (params) =>
  name = params.url;
  model = params.model;
  entities[name] = model;

build = (entity) =>
  app = config.get('app');
  prefix = config.get('prefix');

  app.get(prefix || '/', (req, res, next) => {
    resources = {};
    Object.keys(entities).map (name) => {
      resources[name] = `http://${req.headers.host}${prefix}/__metadata/${name}`;
    }
    res.json({resources: resources});
  });

  ebject.keys(entities).map((name) => {
    app.get("#{prefix}/__metadata/#{name}", (req, res, next) => {
      metadata = parser.toMetadata(entities[name]);
      res.json({[name]: metadata});
    });
  });

module.exports = {
  register: register,
  build: build,
}
