import express from 'express';
import bodyParser from 'body-parser';
import methodOverride from 'method-override';
import cors from 'cors';

export default function (options) {
  const app = express();
  const opts = (options && options.expressRequestLimit) ?
                { limit: options.expressRequestLimit } : {};
  const corsOrigin = (options && options.corsOrigin) || '*';
  app.use(bodyParser.json(opts));
  opts.extended = true;
  app.use(bodyParser.urlencoded(opts));
  app.use(methodOverride());
  app.use(express.query());
  app.use(cors({
    origin: corsOrigin,
  }));
  app.disable('x-powered-by');
  return app;
}
