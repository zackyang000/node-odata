import 'should';
import request from 'supertest';
import { odata, conn, host, port, bookSchema, initData } from './support/setup';

describe('odata.query.filter.functions', function() {
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

  describe('[contains]', () => {
    it('should filter items', async function() {
      const res = await request(host).get(`/book?$filter=contains(title,'i')`); 
      res.body.value.length.should.greaterThan(0);
      res.body.value.should.matchEach((item) => item.title.indexOf('i') >= 1);
    });
    it('should filter items when it has extra spaces in query string', async function() {
      const res = await request(host).get(`/book?$filter=contains(title,'Visual Studio')`); 
      res.body.value.length.should.greaterThan(0);
      res.body.value.should.matchEach((item) => item.title.indexOf('Visual Studio') >= 0);
    });
  });

  describe('[indexof]', () => {
    it('should filter items', async function() {
      const res = await request(host).get(`/book?$filter=indexof(title,'i') ge 1`); 
      res.body.value.length.should.greaterThan(0);
      res.body.value.should.matchEach((item) => item.title.indexOf('i') >= 1);
    });
    it('should filter items when it has extra spaces in query string', async function() {
      const res = await request(host).get(`/book?$filter=indexof(title,'Visual Studio') ge 0`); 
      res.body.value.length.should.greaterThan(0);
      res.body.value.should.matchEach((item) => item.title.indexOf('Visual Studio') >= 0);
    });
  });

  describe('[year]', () => {
    it('should filter items', async function() {
      const res = await request(host).get(`/book?$filter=year(publish_date) eq 2000`); 
        res.body.value.length.should.greaterThan(0);
        res.body.value.should.matchEach((item) => new Date(item.publish_date).getFullYear() === 2000);
    });
  });
});
