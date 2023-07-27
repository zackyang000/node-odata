import 'should';
import sinon from 'sinon';
import request from 'supertest';
import { odata, host, port, assertSuccess } from '../../support/setup';
import data from '../../support/books.json';
import { BookModel } from '../../support/books.model';

describe('odata.query.filter', function () {
  const query = {
    $where: () => { },
    where: () => { },
    equals: () => { },
    gte: () => { },
    lt: () => { },
    exec: () => { },
    model: BookModel
  };
  let httpServer, modelMock, queryMock;

  before(async function () {
    const server = odata();

    server.mongoEntity('book', BookModel);
    httpServer = server.listen(port);

  });

  after(() => {
    httpServer.close();
  });

  afterEach(() => {
    modelMock?.restore();
    queryMock?.restore();
  });

  describe('[Equal]', () => {
    it('should filter items', async function () {
      const books = data.filter(item => item.title === 'Midnight Rain');

      modelMock = sinon.mock(BookModel);
      queryMock = sinon.mock(query);
      modelMock.expects('find').once().returns(query);
      queryMock.expects('where').once().withArgs(`title`).returns(query);
      queryMock.expects('equals').once().withArgs('Midnight Rain');
      queryMock.expects('exec').once().callsArgWith(0, null, books.map(item => ({ toObject: () => item })));

      const res = await request(host).get(`/book?$filter=title eq '${data[1].title}'`);

      assertSuccess(res);
      modelMock.verify();
      queryMock.verify();
      res.body.should.deepEqual({
        value: books
      });
    });
    it('should filter items when field has keyword', async function () {
      const books = data.filter(item => item.author === 'Ralls, Kim');

      modelMock = sinon.mock(BookModel);
      queryMock = sinon.mock(query);
      modelMock.expects('find').once().returns(query);
      queryMock.expects('where').once().withArgs(`author`).returns(query);
      queryMock.expects('equals').once().withArgs('Ralls, Kim');
      queryMock.expects('exec').once().callsArgWith(0, null, books.map(item => ({ toObject: () => item })));

      const res = await request(host).get(`/book?$filter=author eq 'Ralls, Kim'`);

      assertSuccess(res);
      modelMock.verify();
      queryMock.verify();
      res.body.should.deepEqual({
        value: books
      });
    });
    it('should filter items when it has extra spaces at begin', async function () {
      const books = data.filter(item => item.title === 'Midnight Rain');

      modelMock = sinon.mock(BookModel);
      queryMock = sinon.mock(query);
      modelMock.expects('find').once().returns(query);
      queryMock.expects('where').once().withArgs(`title`).returns(query);
      queryMock.expects('equals').once().withArgs('Midnight Rain');
      queryMock.expects('exec').once().callsArgWith(0, null, books.map(item => ({ toObject: () => item })));

      const res = await request(host).get(`/book?$filter=   title eq 'Midnight Rain'`);

      assertSuccess(res);
      modelMock.verify();
      queryMock.verify();
      res.body.should.deepEqual({
        value: books
      });
    });
    it('should filter items when it has extra spaces at mid', async function () {
      const books = data.filter(item => item.title === 'Midnight Rain');

      modelMock = sinon.mock(BookModel);
      queryMock = sinon.mock(query);
      modelMock.expects('find').once().returns(query);
      queryMock.expects('where').once().withArgs(`title`).returns(query);
      queryMock.expects('equals').once().withArgs('Midnight Rain');
      queryMock.expects('exec').once().callsArgWith(0, null, books.map(item => ({ toObject: () => item })));

      const res = await request(host).get(`/book?$filter=title   eq   'Midnight Rain'`);

      assertSuccess(res);
      modelMock.verify();
      queryMock.verify();
      res.body.should.deepEqual({
        value: books
      });
    });
    it('should filter items when it has extra spaces at end', async function () {
      const books = data.filter(item => item.title === 'Midnight Rain');

      modelMock = sinon.mock(BookModel);
      queryMock = sinon.mock(query);
      modelMock.expects('find').once().returns(query);
      queryMock.expects('where').once().withArgs(`title`).returns(query);
      queryMock.expects('equals').once().withArgs('Midnight Rain');
      queryMock.expects('exec').once().callsArgWith(0, null, books.map(item => ({ toObject: () => item })));

      const res = await request(host).get(`/book?$filter=title eq '${data[1].title}'   `);

      assertSuccess(res);
      modelMock.verify();
      queryMock.verify();
      res.body.should.deepEqual({
        value: books
      });
    });
    it('should filter items when use chinese keyword', async function () {
      const books = data.filter(item => item.title === '代码大全');

      modelMock = sinon.mock(BookModel);
      queryMock = sinon.mock(query);
      modelMock.expects('find').once().returns(query);
      queryMock.expects('where').once().withArgs(`title`).returns(query);
      queryMock.expects('equals').once().withArgs('代码大全');
      queryMock.expects('exec').once().callsArgWith(0, null, books.map(item => ({ toObject: () => item })));

      const res = await request(host).get(encodeURI(`/book?$filter=title eq '代码大全'`));

      assertSuccess(res);
      modelMock.verify();
      queryMock.verify();
      res.body.should.deepEqual({
        value: books
      });
    });
    it('should filter items when use id', async function () {
      const books = data.filter(item => item.id === '2');

      modelMock = sinon.mock(BookModel);
      queryMock = sinon.mock(query);
      modelMock.expects('find').once().returns(query);
      queryMock.expects('where').once().withArgs(`_id`).returns(query);
      queryMock.expects('equals').once().withArgs('2');
      queryMock.expects('exec').once().callsArgWith(0, null, books.map(item => ({ toObject: () => item })));

      const res = await request(host).get(encodeURI(`/book?$filter=id eq '2'`));

      assertSuccess(res);
      modelMock.verify();
      queryMock.verify();
      res.body.should.deepEqual({
        value: books
      });
    });
  });

  describe("[Not equal]", () => {
    it('should filter items', async function () {
      mock = sinon.mock(resource.model);
      mock.expects('where').once().withArgs('title').returns(resource.model);
      mock.expects('ne').once().withArgs(data[1].title).returns(resource.model);
      await request(host).get(`/book?$filter=title ne '${data[1].title}'`);
      mock.verify();
    });
  });

  describe("[Greater than]", () => {
    it('should filter items', async function () {
      mock = sinon.mock(resource.model);
      mock.expects('where').once().withArgs('price').returns(resource.model);
      mock.expects('gt').once().withArgs(36.95).returns(resource.model);
      await request(host).get(`/book?$filter=price gt 36.95`);
      mock.verify();
    });
  });

  describe('[Greater than or equal]', () => {
    it('should filter items', async function () {
      mock = sinon.mock(resource.model);
      mock.expects('where').once().withArgs('price').returns(resource.model);
      mock.expects('gte').once().withArgs(36.95).returns(resource.model);
      await request(host).get(`/book?$filter=price ge 36.95`);
      mock.verify();
    });
  });

  describe('[Less than]', () => {
    it('should filter items', async function () {
      mock = sinon.mock(resource.model);
      mock.expects('where').once().withArgs('price').returns(resource.model);
      mock.expects('lt').once().withArgs(36.95).returns(resource.model);
      await request(host).get(`/book?$filter=price lt 36.95`);
      mock.verify();
    });
  });

  describe('[Less than or equal]', () => {
    it('should filter items', async function () {
      mock = sinon.mock(resource.model);
      mock.expects('where').once().withArgs('price').returns(resource.model);
      mock.expects('lte').once().withArgs(36.95).returns(resource.model);
      await request(host).get(`/book?$filter=price le 36.95`);
      mock.verify();
    });
  });

  describe('[Logical and]', () => {
    it("should filter items", async function () {
      mock = sinon.mock(resource.model);
      mock.expects('where').withArgs('title').returns(resource.model);
      mock.expects('where').withArgs('price').returns(resource.model);
      mock.expects('ne').once().withArgs(data[1].title).returns(resource.model);
      mock.expects('gte').once().withArgs(36.95).returns(resource.model);
      await request(host).get(`/book?$filter=title ne '${data[1].title}' and price ge 36.95`);
      mock.verify();
    });
    it("should filter items when it has extra spaces", async function () {
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
