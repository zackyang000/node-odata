import 'should';
import request from 'supertest';
import { odata, host, port } from '../../support/setup';
import mongoose from 'mongoose';
import { connect } from '../../support/db';
import { BookModel } from '../../support/books.model';

describe('mongo.Entity', () => {
  let httpServer
  
  before(() => {
    const server = odata();

    server.mongoEntity('book', BookModel);
    connect(server);
    
    httpServer = server.listen(port);
  });

  after(() => {
    httpServer.close();
    mongoose.default.connection.close();
  });

  it('should work', async function () {
    const res = await request(host).get('/book');
    res.body.should.be.have.property('value');
  });
});
