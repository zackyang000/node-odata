import 'should';
import request from 'supertest';
import { odata, conn, host, port, bookSchema, initData } from './support/setup';

describe('odata.query.count', function() {
  let httpServer;

  before(async function() {
    await initData();
    const server = odata(conn);
    server.resource('book', bookSchema)
    httpServer = server.listen(port);
  });

  after(() => {
    httpServer.close();
  });

  it('should get count', async function() {
    const res = await request(host).get('/book?$count=true');
    res.body.should.be.have.property('@odata.count');
    res.body.should.be.have.property('value');
    res.body['@odata.count'].should.be.equal(res.body.value.length);
  });
  it('should not get count', async function() {
    const res = await request(host).get('/book?$count=false');
    res.body.should.be.not.have.property('@odata.count');
  });
  it('should 500 when $count isn\'t \'true\' or \'false\'', async function() {
    const res = await request(host).get('/book?$count=1');
    res.error.status.should.be.equal(500);
  });
});
