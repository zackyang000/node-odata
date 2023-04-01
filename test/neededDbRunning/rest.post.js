import 'should';
import request from 'supertest';
import { odata, host, port, bookSchema, conn } from '../support/setup';

describe('rest.post', () => {
  let httpServer, server;

  before(function() {
    server = odata(conn);
    server.resource('book', bookSchema)
    httpServer = server.listen(port);
  });

  after(() => {
    const db = server.get('db');

    httpServer.close();
    db.closeConnection();
  });

  it('should create new resource', async function() {
    const res = await request(host)
    .post(`/book`)
    .send({ title: 'rest.post.js' });    
    if (!res.ok) {
      res.text.should.equal('');
    }
    res.body.should.be.have.property('id');
    res.body.should.be.have.property('title');
  });
});
