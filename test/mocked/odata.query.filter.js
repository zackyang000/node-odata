import 'should';
import sinon from 'sinon';
import request from 'supertest';
import { odata, host, port, bookSchema } from '../support/setup';
import data from '../support/books.json';
import FakeDb from '../support/fake-db';

describe('odata.query.filter', function() {
  let httpServer, books, resource, mock;

  before(async function() {
    const db = new FakeDb();
    const server = odata(db);
    server.resource('book', bookSchema);
    resource = server.resources.book;
    httpServer = server.listen(port);
    books = db.addData('book', data);
  });

  after(() => {
    httpServer.close();
  });

  afterEach(() => {
    mock.restore();
  });

  describe('[Equal]', () => {
    it('should filter items', async function(){
      mock = sinon.mock(resource.model);
      mock.expects('where').once().withArgs('title').returns(resource.model);
      mock.expects('equals').once().withArgs(data[1].title).returns(resource.model);
      await request(host).get(`/book?$filter=title eq '${data[1].title}'`); 
      mock.verify();
    });
    it('should filter items when field has keyword', async function(){
      mock = sinon.mock(resource.model);
      mock.expects('where').once().withArgs('author').returns(resource.model);
      mock.expects('equals').once().withArgs('Ralls, Kim').returns(resource.model);
      await request(host).get(`/book?$filter=author eq 'Ralls, Kim'`); 
      mock.verify();
    });
    it('should filter items when it has extra spaces at begin', async function(){
      mock = sinon.mock(resource.model);
      mock.expects('where').once().withArgs('title').returns(resource.model);
      mock.expects('equals').once().withArgs(data[1].title).returns(resource.model);
      await request(host).get(`/book?$filter=   title eq '${data[1].title}'`); 
      mock.verify();
    });
    it('should filter items when it has extra spaces at mid', async function(){
      mock = sinon.mock(resource.model);
      mock.expects('where').once().withArgs('title').returns(resource.model);
      mock.expects('equals').once().withArgs(data[1].title).returns(resource.model);
      await request(host).get(`/book?$filter=title   eq   '${data[1].title}'`); 
      mock.verify();
    });
    it('should filter items when it has extra spaces at end', async function(){
      mock = sinon.mock(resource.model);
      mock.expects('where').once().withArgs('title').returns(resource.model);
      mock.expects('equals').once().withArgs(data[1].title).returns(resource.model);
      await request(host).get(`/book?$filter=title eq '${data[1].title}'   `); 
      mock.verify();
    });
    it('should filter items when use chinese keyword', async function(){
      mock = sinon.mock(resource.model);
      mock.expects('where').once().withArgs('title').returns(resource.model);
      mock.expects('equals').once().withArgs('代码大全').returns(resource.model);
      await request(host).get(encodeURI(`/book?$filter=title eq '代码大全'`));
      mock.verify();
    });
    it('should filter items when use id', async function(){
      mock = sinon.mock(resource.model);
      mock.expects('where').once().withArgs('_id').returns(resource.model);
      mock.expects('equals').once().withArgs(books[1].id).returns(resource.model);
      await request(host).get(encodeURI(`/book?$filter=id eq '${books[1].id}'`));
      mock.verify();
    });
  });

  describe("[Not equal]", () => {
    it('should filter items', async function(){
      mock = sinon.mock(resource.model);
      mock.expects('where').once().withArgs('title').returns(resource.model);
      mock.expects('ne').once().withArgs(data[1].title).returns(resource.model);
      await request(host).get(`/book?$filter=title ne '${data[1].title}'`); 
      mock.verify();
    });
  });

  describe("[Greater than]", () => {
    it('should filter items', async function(){
      mock = sinon.mock(resource.model);
      mock.expects('where').once().withArgs('price').returns(resource.model);
      mock.expects('gt').once().withArgs(36.95).returns(resource.model);
      await request(host).get(`/book?$filter=price gt 36.95`); 
      mock.verify();
    });
  });

  describe('[Greater than or equal]', () => {
    it('should filter items', async function(){
      mock = sinon.mock(resource.model);
      mock.expects('where').once().withArgs('price').returns(resource.model);
      mock.expects('gte').once().withArgs(36.95).returns(resource.model);
      await request(host).get(`/book?$filter=price ge 36.95`); 
      mock.verify();
    });
  });

  describe('[Less than]', () => {
    it('should filter items', async function() {
      mock = sinon.mock(resource.model);
      mock.expects('where').once().withArgs('price').returns(resource.model);
      mock.expects('lt').once().withArgs(36.95).returns(resource.model);
      await request(host).get(`/book?$filter=price lt 36.95`); 
      mock.verify();
    });
  });

  describe('[Less than or equal]', () => {
    it('should filter items', async function() {
      mock = sinon.mock(resource.model);
      mock.expects('where').once().withArgs('price').returns(resource.model);
      mock.expects('lte').once().withArgs(36.95).returns(resource.model);
      await request(host).get(`/book?$filter=price le 36.95`); 
      mock.verify();
    });
  });

  describe('[Logical and]', () => {
    it("should filter items", async function() {
      mock = sinon.mock(resource.model);
      mock.expects('where').withArgs('title').returns(resource.model);
      mock.expects('where').withArgs('price').returns(resource.model);
      mock.expects('ne').once().withArgs(data[1].title).returns(resource.model);
      mock.expects('gte').once().withArgs(36.95).returns(resource.model);
      await request(host).get(`/book?$filter=title ne '${data[1].title}' and price ge 36.95`); 
      mock.verify();
    });
    it("should filter items when it has extra spaces", async function() {
      mock = sinon.mock(resource.model);
      mock.expects('where').withArgs('title').returns(resource.model);
      mock.expects('where').withArgs('price').returns(resource.model);
      mock.expects('ne').once().withArgs(data[1].title).returns(resource.model);
      mock.expects('gte').once().withArgs(36.95).returns(resource.model);
      await request(host).get(`/book?$filter=title ne '${data[1].title}'   and   price ge 36.95`); 
      mock.verify();
    });
  });
});
