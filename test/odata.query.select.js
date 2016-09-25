import 'should';
import request from 'supertest';
import { odata, conn, host, port, bookSchema, initData } from './support/setup';

describe('odata.query.select', () => {
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

  it('should select anyone field', async function() {
    const res = await request(host).get('/book?$select=price');
    res.body.value[0].should.be.have.property('price');
    res.body.value[0].should.be.not.have.property('title');
    res.body.value[0].should.be.not.have.property('id');
  });
  it('should select multiple field', async function() {
    const res = await request(host).get('/book?$select=price,title');
    res.body.value[0].should.be.have.property('price');
    res.body.value[0].should.be.have.property('title');
    res.body.value[0].should.be.not.have.property('id');
  });
  it('should select multiple field with blank space', async function() {
    const res = await request(host).get('/book?$select=price,   title');
    res.body.value[0].should.be.have.property('price');
    res.body.value[0].should.be.have.property('title');
    res.body.value[0].should.be.not.have.property('id');
  });
  it('should select id field', async function() {
    const res = await request(host).get('/book?$select=price,title,id');
    res.body.value[0].should.be.have.property('price');
    res.body.value[0].should.be.have.property('title');
    res.body.value[0].should.be.have.property('id');
  });
  it('should ignore when select not exist field', async function() {
    const res = await request(host).get('/book?$select=not-exist-field');
    res.body.value[0].should.be.have.property('id');
  });
});
