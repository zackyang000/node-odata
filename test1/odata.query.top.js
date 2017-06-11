import 'should';
import request from 'supertest';
import { odata, conn, host, port, books, bookSchema, initData } from './support/setup';

describe('odata.query.top', () => {
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

  it('should top items', async function() {
    const res = await request(host).get('/book?$top=1');
    res.body.value.length.should.be.equal(1);
  });
  it('should iginre when top not a number', async function() {
    const res = await request(host).get('/book?$top=not-a-number');
    res.body.value.length.should.be.equal(books.length);
  });
  it('should ignore when top not a positive number', async function() {
    const res = await request(host).get('/book?$top=-1');
    res.body.value.length.should.be.equal(books.length);
  });
});
