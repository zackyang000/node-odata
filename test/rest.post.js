import 'should';
import request from 'supertest';
import { odata, host, port, bookSchema } from './support/setup';
import FakeDb from './support/fake-db';

describe('rest.post', () => {
  let httpServer;

  before(async function() {
    const db = new FakeDb();
    const server = odata(db);
    server.resource('book', bookSchema)
    httpServer = server.listen(port);
  });

  after(() => {
    httpServer.close();
  });

  it('should create new resource', async function() {
    const res = await request(host)
    .post(`/book`)
    .send({ title: Math.random() });
    res.body.should.be.have.property('id');
    res.body.should.be.have.property('title');
  });
  it('should be 422 if post without data', async function() {
    const res = await request(host).post(`/book`);
    res.status.should.be.equal(422);
  });
});
