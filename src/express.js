import express from 'express';
import methodOverride from 'method-override';
import cors from 'cors';
import bodyParser from 'body-parser';

export default function orientExpress(options) {
  const app = express();
  const opts = (options && options.expressRequestLimit)
    ? { limit: options.expressRequestLimit } : {};

  opts.extended = true;
  app.use(bodyParser.urlencoded(opts));
  app.use(methodOverride());
  app.use(express.query());
  app.use(cors(options && options.corsOptions));
  app.disable('x-powered-by');
  return app;
}
