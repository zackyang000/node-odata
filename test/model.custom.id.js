import 'should';
import request from 'supertest';
import { odata, conn, host, port } from './support/setup';

describe('model.custom.id', () => {
  let httpServer;

  before(async function() {
    const server = odata(conn);
    server.resource('custom-id', { id: Number });
    httpServer = server.listen(port);
    await request(host).post('/custom-id').send({ id: 100 });
  });

  after(() => {
    httpServer.close();
  });

  it('should work when use a custom id to query specific entity', async function() {
    const res = await request(host).get('/custom-id(100)');
    res.body.id.should.be.equal(100);
  });

  it('should work when use a custom id to query a list', async function() {
    const res = await request(host).get('/custom-id?$filter=id eq \'100\'');
    res.body.value.length.should.be.greaterThan(0);
  });
});
