import 'should';
import request from 'supertest';
import { odata, host, port, bookSchema } from '../support/setup';
import FakeDb from '../support/fake-db';

describe('odata.api.Resouce', () => {
  let httpServer;

  before(() => {
    const db = new FakeDb();
    const server = odata(db);
    server.resource('book', bookSchema);
    httpServer = server.listen(port);
  });

  after(() => {
    httpServer.close();
  });

  it('should work', async function() {
    const res = await request(host).get('/book'); 
    res.body.should.be.have.property('value');
  });
});
