import 'should';
import request from 'supertest';
import { odata, conn, host, port, bookSchema, initData } from './support/setup';

describe('rest.get', () => {
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
