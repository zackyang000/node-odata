import 'should';
import request from 'supertest';
import { odata, host, port } from './support/setup';

describe('odata.api.Function', () => {
  let httpServer;

  before(() => {
    const server = odata();
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
