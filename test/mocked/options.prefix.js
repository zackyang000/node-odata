import 'should';
import request from 'supertest';
import { odata, host, port, bookSchema } from '../support/setup';
import FakeDb from '../support/fake-db';

describe('options.prefix', () => {
  let httpServer, db;

  before(() => {
    db = new FakeDb();
  });

  afterEach(() => {
    httpServer.close();
  });

  it('should be work', async function() {
    const server = odata(db);
    server.resource('book', bookSchema);
    server.set('prefix', '/api');
    httpServer = server.listen(port);
    const res = await request(host).get('/api/book');
    res.status.should.be.equal(200);
  });
  it('should be 200 when do not add `/`', async function() {
    const server = odata(db);
    server.resource('book', bookSchema);
    server.set('prefix', 'api');
    httpServer = server.listen(port);
    const res = await request(host).get('/api/book');
    res.status.should.be.equal(200);
  });
  it('should be 200 when set it at init-function', async function() {
    const server = odata(db, '/api');
    server.resource('book', bookSchema);
    httpServer = server.listen(port);
    const res = await request(host).get('/api/book');
    res.status.should.be.equal(200);
  });
});
