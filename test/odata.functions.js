import 'should';
import request from 'supertest';
import { odata, host, port } from './support/setup';
import FakeDb from './support/fake-db';

describe('odata.functions', () => {
  ['get', 'post', 'put', 'delete'].map((method) => {
    describe(method, function(done) {
      let httpServer;

      before(() => {
        const server = odata(new FakeDb());
        const router = odata.Function().router();
        router[method]('/test', (req, res, next) => res.jsonp({ test: 'ok' }));
        server.use(router);
        httpServer = server.listen(port);
      });

      after(() => {
        httpServer.close();
      });

      it('should work', async function() {
        const res = await request(host)[method]("/test");
        res.body.test.should.be.equal('ok');
      });
    });
  });
});
