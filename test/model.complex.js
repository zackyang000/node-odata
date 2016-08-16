// For issue: https://github.com/TossShinHwa/node-odata/issues/55

import 'should';
import request from 'supertest';
import { odata, conn, host, port } from './support/setup';

describe('model.complex', () => {
  before((done) => {
    const server = odata(conn);
    server.resource('complex-model', { p1: [{ p2: String }] });
    server.listen(port, done);
  });

  it('should work when PUT a complex entity', async function() {
    const entity = await addResource();
    await updateResouce(entity.body.id);
    const res = await queryResource(entity.body.id);
    res.body.p1[0].p2.should.be.equal('new');
  });
});

function addResource() {
  return new Promise((resolve, reject) => {
    return request(host)
    .post('/complex-model')
    .send({ p1: [{ p2: 'origin' }] })
    .expect(201)
    .end((err, res) => {
      if (err) {
        return reject(err);
      }
      resolve(res);
    });
  });
}

function updateResouce(id) {
  return new Promise((resolve, reject) => {
    return request(host)
    .put(`/complex-model(${id})`)
    .send({ p1: [{ p2: 'new' }] })
    .expect(200)
    .end((err, res) => {
      if (err) {
        return reject(err);
      }
      resolve(res);
    });
  });
}

function queryResource(id) {
  return new Promise((resolve, reject) => {
    return request(host)
    .get(`/complex-model(${id})`)
    .expect(200)
    .end((err, res) => {
      if (err) {
        return reject(err);
      }
      resolve(res);
    });
  });
}
