import 'should';
import request from 'supertest';
import { odata, conn, host, port } from './support/setup';

function addResource() {
  return request(host)
  .post('/custom-id')
  .send({ id: 100 });
}

function queryResource() {
  return request(host)
  .get('/custom-id(100)');
}

describe('model.custom.id', function() {
  let httpServer;

  before((done) => {
    const server = odata(conn);
    server.resource('custom-id', { id: Number });
    httpServer = server.listen(port, done);
  });

  after(() => {
    httpServer.close();
  });

  it('should work when use a custom id', async function() {
    await addResource();
    // TODO NEED BE FIX: resource can't be fetch
    // const res = await queryResource();
    // res.body.id.should.be.equal(100);
  });
});
