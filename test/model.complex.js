// For issue: https://github.com/TossShinHwa/node-odata/issues/55

import 'should';
import request from 'supertest';
import { odata, conn, host, port } from './support/setup';

function addResource() {
  return request(host)
  .post('/complex-model')
  .send({ p1: [{ p2: 'origin' }] });
}

function updateResouce(id) {
  return request(host)
  .put(`/complex-model(${id})`)
  .send({ p1: [{ p2: 'new' }] });
}

function queryResource(id) {
  return request(host)
  .get(`/complex-model(${id})`);
}

describe('model.complex', () => {
  let httpServer;

  before(() => {
    const server = odata(conn);
    server.resource('complex-model', { p1: [{ p2: String }] });
    httpServer = server.listen(port);
  });

  after(() => {
    httpServer.close();
  });

  it('should work when PUT a complex entity', async function() {
    const entity = await addResource();
    await updateResouce(entity.body.id);
    const res = await queryResource(entity.body.id);
    res.body.p1[0].p2.should.be.equal('new');
  });
});
