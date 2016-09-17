import 'should';
import request from 'supertest';
import { odata, conn, host, port, books, bookSchema, initData } from './support/setup';

describe('options.maxTop', () => {
  let httpServer, server;

  beforeEach(async function() {
    await initData();
    server = odata(conn);
  });

  afterEach(() => {
    httpServer.close();
  });

  it('global-limit should work', async function() {
    server.set('maxTop', 1);
    server.resource('book', bookSchema);
    httpServer = server.listen(port);
    const res = await request(host).get('/book?$top=100');
    res.body.value.length.should.be.equal(1);
  });
  it('resource-limit should work', async function() {
    server.resource('book', bookSchema).maxTop(2);
    httpServer = server.listen(port);
    const res = await request(host).get('/book?$top=1');
    res.body.value.length.should.be.equal(1);
  });
  it('should use resource-limit even global-limit already set', async function() {
    server.set('maxTop', 2);
    server.resource('book', bookSchema).maxTop(1);
    httpServer = server.listen(port);
    const res = await request(host).get('/book?$top=100');
    res.body.value.length.should.be.equal(1);
  });
  it('should use query-limit if it is minimum global-limit', async function() {
    server.set('maxTop', 2);
    server.resource('book', bookSchema);
    httpServer = server.listen(port);
    const res = await request(host).get('/book?$top=1');
    res.body.value.length.should.be.equal(1);
  });
  it('should use query-limit if it is minimum resource-limit', async function() {
    server.resource('book', bookSchema).maxTop(2);
    httpServer = server.listen(port);
    const res = await request(host).get('/book?$top=1');
    res.body.value.length.should.be.equal(1);
  });
});
