import express from 'express';

export default class {
  constructor() {
    this._router = express.Router();
  }

  router() {
    return this._router;
  }
}
