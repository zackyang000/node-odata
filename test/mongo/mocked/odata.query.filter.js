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
      modelMock.expects('find').once().withArgs({title: {$eq: 'Midnight Rain'}}).returns(query);
      queryMock.expects('exec').once().callsArgWith(0, null, books.map(item => ({ toObject: () => item })));

      const res = await request(host).get(`/book?$filter=title eq 'Midnight Rain'`);

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
      modelMock.expects('find').once().withArgs({author: {$eq: 'Ralls, Kim'}}).returns(query);
      queryMock.expects('exec').once().callsArgWith(0, null, books.map(item => ({ toObject: () => item })));

      const res = await request(host).get(`/book?$filter=author eq 'Ralls, Kim'`);

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
      modelMock.expects('find').once().withArgs({_id: {$eq: '2'}}).returns(query);
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
      const books = data.filter(item => item.author != 'Ralls, Kim');

      modelMock = sinon.mock(BookModel);
      queryMock = sinon.mock(query);
      modelMock.expects('find').once().withArgs({author: {$ne: 'Ralls, Kim'}}).returns(query);
      queryMock.expects('exec').once().callsArgWith(0, null, books.map(item => ({ toObject: () => item })));

      const res = await request(host).get(`/book?$filter=author ne 'Ralls, Kim'`);

      assertSuccess(res);
      modelMock.verify();
      queryMock.verify();
      res.body.should.deepEqual({
        value: books
      });
    });
  });

  describe("[Greater than]", () => {
    it('should filter items', async function () {
      const books = data.filter(item => item.price > 36.95);

      modelMock = sinon.mock(BookModel);
      queryMock = sinon.mock(query);
      modelMock.expects('find').once().withArgs({price: {$gt: 36.95}}).returns(query);
      queryMock.expects('exec').once().callsArgWith(0, null, books.map(item => ({ toObject: () => item })));

      const res = await request(host).get(`/book?$filter=price gt 36.95`);

      assertSuccess(res);
      modelMock.verify();
      queryMock.verify();
      res.body.should.deepEqual({
        value: books
      });
    });
  });

  describe('[Greater than or equal]', () => {
    it('should filter items', async function () {
      const books = data.filter(item => item.price >= 36.95);

      modelMock = sinon.mock(BookModel);
      queryMock = sinon.mock(query);
      modelMock.expects('find').once().withArgs({price: {$gte: 36.95}}).returns(query);
      queryMock.expects('exec').once().callsArgWith(0, null, books.map(item => ({ toObject: () => item })));

      const res = await request(host).get(`/book?$filter=price ge 36.95`);

      assertSuccess(res);
      modelMock.verify();
      queryMock.verify();
      res.body.should.deepEqual({
        value: books
      });
    });
  });

  describe('[Less than]', () => {
    it('should filter items', async function () {
      const books = data.filter(item => item.price < 36.95);

      modelMock = sinon.mock(BookModel);
      queryMock = sinon.mock(query);
      modelMock.expects('find').once().withArgs({price: {$lt: 36.95}}).returns(query);
      queryMock.expects('exec').once().callsArgWith(0, null, books.map(item => ({ toObject: () => item })));

      const res = await request(host).get(`/book?$filter=price lt 36.95`);

      assertSuccess(res);
      modelMock.verify();
      queryMock.verify();
      res.body.should.deepEqual({
        value: books
      });
    });
  });

  describe('[Less than or equal]', () => {
    it('should filter items', async function () {
      const books = data.filter(item => item.price <= 36.95);

      modelMock = sinon.mock(BookModel);
      queryMock = sinon.mock(query);
      modelMock.expects('find').once().withArgs({price: {$lte: 36.95}}).returns(query);
      queryMock.expects('exec').once().callsArgWith(0, null, books.map(item => ({ toObject: () => item })));

      const res = await request(host).get(`/book?$filter=price le 36.95`);

      assertSuccess(res);
      modelMock.verify();
      queryMock.verify();
      res.body.should.deepEqual({
        value: books
      });
    });
  });

  describe('[Logical and]', () => {
    it("should filter items", async function () {
      const books = data.filter(item => item.title != 'Midnight Rain' && item.price >= 36.95);

      modelMock = sinon.mock(BookModel);
      queryMock = sinon.mock(query);
      modelMock.expects('find').once()
      .withArgs({
        $and: [{
          title: {$ne: 'Midnight Rain'}
        }, {
          price: {$gte: 36.95}
        }]}).returns(query);
      queryMock.expects('exec').once().callsArgWith(0, null, books.map(item => ({ toObject: () => item })));

      const res = await request(host).get(`/book?$filter=title ne 'Midnight Rain' and price ge 36.95`);

      assertSuccess(res);
      modelMock.verify();
      queryMock.verify();
      res.body.should.deepEqual({
        value: books
      });
    });
  });
});
