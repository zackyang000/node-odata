import 'should';
import request from 'supertest';
import { odata, conn, host, port, bookSchema, initData } from './support/setup';

describe('odata.query.filter', function() {
  let data, httpServer;

  before(async function() {
    data = await initData();
    const server = odata(conn);
    server.resource('book', bookSchema)
    httpServer = server.listen(port);
  });

  after(() => {
    httpServer.close();
  });

  describe('[Equal]', () => {
    it('should filter items', async function(){
      const res = await request(host).get(`/book?$filter=title eq '${data[1].title}'`); 
      res.body.value.length.should.be.equal(1);
      res.body.value[0].title.should.be.equal(data[1].title);
    });
    it('should filter items when field has keyword', async function(){
      const res = await request(host).get(`/book?$filter=author eq 'Ralls, Kim'`); 
      res.body.value.length.should.be.equal(1);
    });
    it('should filter items when it has extra spaces at begin', async function(){
      const res = await request(host).get(`/book?$filter=   title eq '${data[1].title}'`); 
      res.body.value.length.should.be.equal(1);
      res.body.value[0].title.should.be.equal(data[1].title);
    });
    it('should filter items when it has extra spaces at mid', async function(){
      const res = await request(host).get(`/book?$filter=title   eq   '${data[1].title}'`); 
      res.body.value.length.should.be.equal(1);
      res.body.value[0].title.should.be.equal(data[1].title);
    });
    it('should filter items when it has extra spaces at end', async function(){
      const res = await request(host).get(`/book?$filter=title eq '${data[1].title}'   `); 
      res.body.value.length.should.be.equal(1);
      res.body.value[0].title.should.be.equal(data[1].title);
    });
    it('should filter items when use chinese keyword', async function(){
      const res = await request(host).get(encodeURI(`/book?$filter=title eq '代码大全'`));
      res.body.value.length.should.be.equal(1);
      res.body.value[0].title.should.be.equal('代码大全');
    });
    it('should filter items when use id', async function(){
      const res = await request(host).get(encodeURI(`/book?$filter=id eq '${data[1].id}'`));
      res.body.value.length.should.be.equal(1);
      res.body.value[0].id.should.be.equal(data[1].id);
    });
  });

  describe("[Not equal]", () => {
    it('should filter items', async function(){
      const res = await request(host).get(`/book?$filter=title ne '${data[1].title}'`); 
      res.body.value.length.should.greaterThan(0);
      res.body.value.should.matchEach((item) => item.title !== data[1].title);
    });
  });

  describe("[Greater than]", () => {
    it('should filter items', async function(){
      const res = await request(host).get(`/book?$filter=price gt 36.95`); 
      res.body.value.length.should.greaterThan(0);
      res.body.value.should.matchEach((item) => item.price > 36.95);
    });
  });

  describe('[Greater than or equal]', () => {
    it('should filter items', async function(){
      const res = await request(host).get(`/book?$filter=price ge 36.95`); 
      res.body.value.length.should.greaterThan(0);
      res.body.value.should.matchEach((item) => item.price >= 36.95);
    });
  });

  describe('[Less than]', () => {
    it('should filter items', async function() {
      const res = await request(host).get(`/book?$filter=price lt 36.95`); 
      res.body.value.should.matchEach((item) => item.price < 36.95);
    });
  });

  describe('[Less than or equal]', () => {
    it('should filter items', async function() {
      const res = await request(host).get(`/book?$filter=price le 36.95`); 
      res.body.value.should.matchEach((item) => item.price <= 36.95);
    });
  });

  describe('[Logical and]', () => {
    it("should filter items", async function() {
      const res = await request(host).get(`/book?$filter=title ne '${data[1].title}' and price ge 36.95`); 
      res.body.value.length.should.greaterThan(0);
      res.body.value.should.matchEach((item) => item.title !== data[1].title);
      res.body.value.should.matchEach((item) => item.price >= 36.95);
    });
    it("should filter items when it has extra spaces", async function() {
      const res = await request(host).get(`/book?$filter=title ne '${data[1].title}'   and   price ge 36.95`); 
      res.body.value.length.should.greaterThan(0);
      res.body.value.should.matchEach((item) => item.title !== data[1].title);
      res.body.value.should.matchEach((item) => item.price >= 36.95);
    });
  });
});
