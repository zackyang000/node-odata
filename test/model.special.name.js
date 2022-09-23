import 'should';
import request from 'supertest';
import { odata, host, port } from './support/setup';
import FakeDb from './support/fake-db';

describe('model.special.name', () => {
  let httpServer;

  before(() => {
    const db = new FakeDb();
    const server = odata(db);
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
