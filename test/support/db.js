
import mongoose from 'mongoose';
import { conn } from '../support/setup';

export function init(server) {
  server.addBefore((req, res, next) => {
    req.$odata = {
      ...req.$odata,
      mongo: mongoose.default.connection
    };
    next();
  });
}

export function connect(server) {
  mongoose.connect(process.env.DATABASE || conn, null, (err) => {
    if (err) {
      console.error(err.message);
      console.error('Failed to connect to database on startup.');
      process.exit();
    }
  });
  init(server);
}