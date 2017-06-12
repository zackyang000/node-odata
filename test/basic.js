require('should');
const request = require('supertest');
const { conn, bookSchema, initData } = require('./support/setup');
const odata = require('../');

class Book extends odata.Resource {
  constructor() {
    super('book', bookSchema);
  }
}

describe('rest.get', () => {
  let data, app;

  before(async function() {
    data = await initData();
    app = new odata(conn);
    app.use([Book, Book]);
  });

  it('should return all of the resources', async function() {
    const res = await request(app).get(`/book`);
    res.body.should.be.have.property('value');
    res.body.value.length.should.be.equal(data.length);
  });
});
