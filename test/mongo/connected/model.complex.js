import 'should';
import request from 'supertest';
import { odata, host, port, assertSuccess } from '../../support/setup';
import mongoose from 'mongoose';
import { connect } from '../../support/db';

const Schema = mongoose.Schema;

function addResource() {
  return request(host)
  .post('/complex-model')
  .send({ p1: [{ p2: 'origin' }] });
}

function updateResouce(id) {
  return request(host)
  .put(`/complex-model('${id}')`)
  .send({ p1: [{ p2: 'new' }] });
}

function queryResource(id) {
  return request(host)
  .get(`/complex-model('${id}')`);
}

describe('mongo.connected.model.complex', () => {
  let httpServer;

  before(() => {
    const server = odata();
    const ComplexModelSchema = new Schema({ p1: [{ p2: String }] });

    const ComplexModel = mongoose.model('p1', ComplexModelSchema);
    server.mongoEntity('complex-model', ComplexModel);
    connect(server);
    httpServer = server.listen(port);
  });

  after(() => {
    httpServer.close();
    mongoose.default.connection.close();
  });

  it('should work when PUT a complex entity', async function() {
    const entity = await addResource();
    entity.body.should.have.property('id');
    assertSuccess(entity)
    let res = await updateResouce(entity.body.id);
    assertSuccess(res);
    res = await queryResource(entity.body.id);
    assertSuccess(res);
    res.body.p1[0].p2.should.be.equal('new');
  });
});
