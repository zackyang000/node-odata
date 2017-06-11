require('should');
const request = require('supertest');
const { conn, host, port, bookSchema, initData } = require('./support/setup');
const odata = require('../index');
const { Resource, queryable, action } = odata;

class Book extends Resource {
  constructor() {
    super('book', bookInfo);
  }
}

describe('rest.get', () => {
  let data, httpServer;

  before(async function() {
    data = await initData();
    const server = odata(conn);
    server.registerResource([Book]);
    httpServer = server.listen(port);
  });

  after(() => {
    httpServer.close();
  });

  it('should return all of the resources', async function() {
    const res = await request(host).get(`/book`);
    res.body.should.be.have.property('value');
    res.body.value.length.should.be.equal(data.length);
  });
});
