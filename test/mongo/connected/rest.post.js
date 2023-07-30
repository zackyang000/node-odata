import 'should';
import request from 'supertest';
import { odata, host, port } from '../../support/setup';
import { connect } from '../../support/db';
import mongoose from 'mongoose';
import { BookModel } from '../../support/books.model';

describe('rest.post', () => {
  let httpServer, server;

  before(function() {
    server = odata();
    server.mongoEntity('book', BookModel);
    connect(server);
    httpServer = server.listen(port);
  });

  after(() => {
    httpServer.close();
    mongoose.default.connection.close();
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
  it('should be 422 if post without data', async function() {
    const res = await request(host).post(`/book`);
    res.status.should.be.equal(422);
  });
});
