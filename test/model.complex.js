// For issue: https://github.com/TossShinHwa/node-odata/issues/55

import 'should';
const request = require('supertest');

require('./support');
const odata = require('../.');

let PORT = 0;

describe('model.custom.id', () => {
  before((done) => {
    const server = odata('mongodb://localhost/odata-test');
    server.resource('complex-model', {
      p1: [{ p2: String }],
    });
    const result = server.listen(PORT, () => {
      PORT = result.address().port;
      done();
    });
  });

  it('should work when PUT something', async function() {
    const entity = await addResource();
    await updateResouce(entity.body.id);
    const res = await queryResource(entity.body.id);
    res.body.p1[0].p2.should.be.equal('new');
  });
});

function addResource() {
  return new Promise((resolve, reject) => {
    return request(`http://localhost:${PORT}`)
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
    return request(`http://localhost:${PORT}`)
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
    return request(`http://localhost:${PORT}`)
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
