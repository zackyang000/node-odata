import uuid from 'uuid';
import 'should';
import request from 'supertest';
import { odata, conn, host, port, bookSchema, initData } from './support/setup';

describe('rest.put', () => {
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

  it('should modify resource', async function() {
    const book = data[0];
    book.title = 'modify book';
    const res = await request(host)
    .put(`/book(${book.id})`)
    .send(book);
    res.body.should.be.have.property('title');
    res.body.title.should.be.equal(book.title);
  });
  it('should create resource if send with a id which not exist', async function() {
    const book = {
      id: uuid.v4(),
      title: 'new book',
    };
    const res = await request(host)
    .put(`/book(${book.id})`)
    .send({ title: book.title });
    res.body.should.be.have.property('title');
    res.body.title.should.be.equal(book.title);
    res.body.should.be.have.property('id');
    res.body.id.should.be.equal(book.id);
  });
  it('should be 404 if without id', async function() {
    const res = await request(host).put(`/book`).send(data[0]);
    res.status.should.be.equal(404);
  });
  it("should 400 if with a wrong id", async function() {
    const res = await request(host).put(`/book(wrong-id)`).send(data[0]);
    res.status.should.be.equal(400);
  });
});
