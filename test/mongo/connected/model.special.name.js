import 'should';
import request from 'supertest';
import { odata, host, port, assertSuccess } from '../../support/setup';
import mongoose from 'mongoose';
import { connect } from '../../support/db';

const Schema = mongoose.Schema;

describe('model.special.name', () => {
  let httpServer;

  before(() => {
    const server = odata();
    const ModelSchema = new Schema({ year: Number });

    const Model = mongoose.model('function-keyword', ModelSchema);
    server.mongoEntity('function-keyword', Model);
    connect(server);
    httpServer = server.listen(port);
  });

  after(() => {
    httpServer.close();
    mongoose.default.connection.close();
  });

  it('should work when use odata function keyword', async function() {
    const res = await request(host)
    .post('/function-keyword')
    .send({ year: 2015 });
    assertSuccess(res);
    res.status.should.be.equal(201);
  });
});
