import 'should';
import request from 'supertest';
import { odata, conn, host, port, bookSchema } from './support/setup';

describe('odata.api.Resouce', () => {
  let httpServer;

  before(() => {
    const server = odata(conn);
    const book = odata.Resource('book', bookSchema);
    server.use(book);
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
