import 'should';
import request from 'supertest';
import { odata, conn, host, port, books, bookSchema, initData } from './support/setup';

describe('odata.query.skip', () => {
  let httpServer;

  before(async function() {
    await initData();
    const server = odata(conn);
    server.resource('book', bookSchema)
    httpServer = server.listen(port);
  });

  after(() => {
    httpServer.close();
  });

  it('should skip items', async function() {
    const res = await request(host).get('/book?$skip=1');
    res.body.value.length.should.be.equal(books.length - 1);
  });
  it('should ignore when skip over count of items', async function() {
    const res = await request(host).get('/book?$skip=1024');
    res.body.value.length.should.be.equal(0);
  });
  it('should ignore when skip not a number', async function() {
    const res = await request(host).get('/book?$skip=not-a-number');
    res.body.value.length.should.be.equal(books.length);
  });
  return it('should ignore when skip not a positive number', async function() {
    const res = await request(host).get('/book?$skip=-1');
    res.body.value.length.should.be.equal(books.length);
  });
});
