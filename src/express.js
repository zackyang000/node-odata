import express from 'express';
import bodyParser from 'body-parser';
import methodOverride from 'method-override';
import cors from 'cors';

export default function () {
  const app = express();
  app.use(bodyParser.urlencoded({ extended: true }));
  app.use(bodyParser.json());
  app.use(methodOverride());
  app.use(express.query());
  app.use(cors());
  app.disable('x-powered-by');
  return app;
}
