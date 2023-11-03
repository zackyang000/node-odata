export odata from '../../src';
export const host = 'http://localhost:3000';
export const port = '3000';
export const conn = 'mongodb://localhost/odata-test';

const { BookModel } = require('./books.model');

export const model = BookModel;

export const books = require('./books.json');

export function assertSuccess(res) {
  if (res.error) {
    res.error.message.should.have.value('');
  }
}
