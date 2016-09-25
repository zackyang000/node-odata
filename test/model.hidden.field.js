import 'should';
import request from 'supertest';
import { odata, conn, host, port } from './support/setup';

function addResource() {
  return request(host)
  .post('/hidden-field')
  .send({
    name: 'zack',
    password: '123'
  })
}

function queryResource(id) {
  return request(host).get(`/hidden-field(${id})`);
}

function queryResources() {
  return request(host).get(`/hidden-field`);
}

function queryResourcesWithSelectPassword() {
  return request(host).get('/hidden-field?$select=name, password');
}

function queryResourcesWithOnlySelectPassword() {
  return request(host).get('/hidden-field?$select=password');
}

describe('model.hidden.field', function() {
  let httpServer, id;

  before(function(done) {
    const server = odata(conn);
    server.resource('hidden-field', {
      name: String,
      password: {
        type: String,
        select: false
      }
    });
    httpServer = server.listen(port, async function() {
      // init a resource for test.
      const res = await addResource();
      id = res.body.id;
      done();
    });

  });

  after(() => {
    httpServer.close();
  });

  it("should work when get entity", async function() {
    const res = await queryResource(id);
    res.body.should.be.have.property('name');
    res.body.name.should.be.equal('zack');
    res.body.should.be.not.have.property('password');
  });

  it('should work when get entities list', async function() {
    const res = await queryResources();
    res.body.value[0].should.be.have.property('id');
    res.body.value[0].should.be.have.property('name');
    res.body.value[0].should.be.not.have.property('password');
  });

  it('should work when get entities list even it is selected', async function() {
    const res = await queryResourcesWithSelectPassword();
    res.body.value[0].should.be.have.property('name');
    res.body.value[0].should.be.not.have.property('id');
    res.body.value[0].should.be.not.have.property('password');
  });

  it('should work when get entities list even only it is selected', async function() {
    const res = await queryResourcesWithOnlySelectPassword();
    res.body.value[0].should.be.not.have.property('password');
  });
});
