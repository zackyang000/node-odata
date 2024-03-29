import 'should';
import request from 'supertest';
import { odata, host, port, bookSchema } from './support/setup';
import books from './support/books.json';
import FakeDb from './support/fake-db';

describe('rest.get', () => {
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

  it('should return all of the resources', async function() {
    const res = await request(host).get(`/book`);
    res.body.should.be.have.property('value');
    res.body.value.length.should.be.equal(data.length);
  });
  it('should return special resource', async function() {
    const res = await request(host).get(`/book(${data[0].id})`);
    res.body.should.be.have.property('title');
    res.body.title.should.be.equal(data[0].title);
  });
  it('should be 404 if resouce name not declare', async function() {
    const res = await request(host).get(`/not-exist-resource`);
    res.status.should.be.equal(404);
  });
  it('should be 404 if resource not exist', async function() {
    const res = await request(host).get(`/book(not-exist-id)`);
    res.status.should.be.equal(404);
  });
});
