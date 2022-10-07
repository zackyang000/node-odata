import 'should';
import request from 'supertest';
import { odata, host, port, bookSchema, assertSuccess } from './support/setup';
import books from './support/books.json';
import FakeDb from './support/fake-db';

describe('rest.delete', function() {
  let data, httpServer;

  before(async function() {
    const db = new FakeDb();
    const server = odata(db);
    server.resource('book', bookSchema)
    httpServer = server.listen(port);
    data = db.addData('book', books);
  });

  after(() => {
    httpServer.close();
  });

  it('should delete resource if it exist', async function() {
    const res = await request(host).del(`/book(${data[0].id})`);
    assertSuccess(res);
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
    const id = data[0].id;
    await request(host).del(`/book(${id})`);
    const res = await request(host).del(`/book(${id})`);
    res.status.should.be.equal(404);
  });
});
