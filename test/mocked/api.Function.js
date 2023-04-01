import 'should';
import request from 'supertest';
import { odata, host, port } from '../support/setup';
import FakeDb from '../support/fake-db';

describe('odata.api.Function', () => {
  let httpServer;

  before(() => {
    const db = new FakeDb();
    const server = odata(db);
    server.function('/test', (req, res, next) => res.jsonp({ test: 'ok' }));
    httpServer = server.listen(port);
  });

  after(() => {
    httpServer.close();
  });

  it('should work', async function() {
    const res = await request(host).get('/test');
    res.body.should.be.have.property('test');
    res.body.test.should.be.equal('ok');
  });
});
