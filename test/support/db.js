
import mongoose from 'mongoose';
import { conn } from '../support/setup';
import error from '../../src/mongo/middlewares/error';

export function init(server) {
  server.error = error;
  server.addBefore((req, res, next) => {
    req.$odata = {
      ...req.$odata,
      mongo: mongoose.default.connection
    };
    next();
  });
}

export async function connect(server) {
  try {
    await mongoose.connect(process.env.DATABASE || conn);
    init(server);
    
  } catch(err) {
    console.error(err.message);
    console.error('Failed to connect to database on startup.');
    process.exit();
  }
}