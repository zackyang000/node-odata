import express from 'express';
import bodyParser from 'body-parser';
import methodOverride from 'method-override';
import cors from 'cors';
import multipart from './parser/multipartMixed';

export default function orientExpress(options) {
  const app = express();
  const opts = (options && options.expressRequestLimit)
    ? { limit: options.expressRequestLimit } : {};

  app.use(bodyParser.json(opts));
  opts.extended = true;
  app.use(bodyParser.urlencoded(opts));
  app.use(multipart);
  app.use(methodOverride());
  app.use(express.query());
  app.use(cors(options && options.corsOptions));
  app.disable('x-powered-by');
  return app;
}
