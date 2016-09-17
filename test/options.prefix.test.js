import 'should';
import request from 'supertest';
import { odata, conn, host, port, bookSchema } from './support/setup';

describe('options.prefix', () => {
  let httpServer;

  afterEach(() => {
    httpServer.close();
  });

  it('should be work', async function() {
    const server = odata(conn);
    server.resource('book', bookSchema);
    server.set('prefix', '/api');
    httpServer = server.listen(port);
    const res = await request(host).get('/api/book');
    res.status.should.be.equal(200);
  });
  it('should be 200 when do not add `/`', async function() {
    const server = odata(conn);
    server.resource('book', bookSchema);
    server.set('prefix', 'api');
    httpServer = server.listen(port);
    const res = await request(host).get('/api/book');
    res.status.should.be.equal(200);
  });
  it('should be 200 when set it at init-function', async function() {
    const server = odata(conn, '/api');
    server.resource('book', bookSchema);
    httpServer = server.listen(port);
    const res = await request(host).get('/api/book');
    res.status.should.be.equal(200);
  });
});
