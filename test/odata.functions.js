import 'should';
import request from 'supertest';
import { odata, host, port, assertSuccess } from './support/setup';
import FakeDb from './support/fake-db';

describe('odata.functions', () => {
  ['get', 'post', 'put', 'delete'].map((method) => {
    describe(method, function(done) {
      let httpServer;

      before(() => {
        const server = odata();
        server.function('test',
          (req, res, next) => res.jsonp({ test: 'ok' }),
          { method });
        httpServer = server.listen(port);
      });

      after(() => {
        httpServer.close();
      });

      it('should work', async function() {
        const res = await request(host)[method]("/test");
        assertSuccess(res);
        res.body.test.should.be.equal('ok');
      });
    });
  });
});
