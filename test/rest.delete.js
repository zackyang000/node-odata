import 'should';
import request from 'supertest';
import { odata, conn, host, port, bookSchema, initData } from './support/setup';

describe('rest.delete', function() {
  let data, httpServer;

  before(async function() {
    data = await initData();
    const server = odata(conn);
    server.resource('book', bookSchema)
    httpServer = server.listen(port);
  });

  after(() => {
    httpServer.close();
  });

  it('should delete resource if it exist', async function() {
    const res = await request(host).del(`/book(${data[0].id})`);
    res.status.should.be.equal(204);
  });
  it('should be 404 if resource not exist', async function() {
    const res = await request(host).del(`/book(not-exist-id)`);
    res.status.should.be.equal(404);
  });
  it('should be 404 if without id', async function() {
    const res = await request(host).del(`/book`);
    res.status.should.be.equal(404);
  });
  it('should 404 if try to delete a resource twice', async function() {
    await request(host).del(`/book(${data[0].id})`);
    const res = await request(host).del(`/book(${data[0].id})`);
    res.status.should.be.equal(404);
  });
});
