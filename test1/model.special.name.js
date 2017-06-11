import 'should';
import request from 'supertest';
import { odata, conn, host, port } from './support/setup';

describe('model.special.name', () => {
  let httpServer;

  before(() => {
    const server = odata(conn);
    server.resource('funcion-keyword', { year: Number });
    httpServer = server.listen(port);
  });

  after(() => {
    httpServer.close();
  });

  it('should work when use odata function keyword', async function() {
    const res = await request(host)
    .post('/funcion-keyword')
    .send({ year: 2015 });
    res.status.should.be.equal(201);
  });
});
