import 'should';
import sinon from 'sinon';
import request from 'supertest';
import { odata, host, port, assertSuccess } from '../../support/setup';
import data from '../../support/books.json';
import { BookModel } from '../../support/books.model';

describe('odata.query.select', () => {
  const query = {
    $where: () => { },
    where: () => { },
    equals: () => { },
    select: () => { },
    sort: () => { },
    exec: () => { },
    model: BookModel
  };
  let httpServer, modelMock, queryMock;

  before(async function() {
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

  it('should select anyone field', async function() {
    const books = data.map(item => ({
      price: item.price
    }));

    modelMock = sinon.mock(BookModel);
    queryMock = sinon.mock(query);
    modelMock.expects('find').returns(query);
    queryMock.expects('select').once().withArgs({
      _id: 0,
      price: 1
    });
    queryMock.expects('exec').once().callsArgWith(0, null, books.map(item => ({ toObject: () => item })));

    const res = await request(host).get('/book?$select=price');

    assertSuccess(res);
    modelMock.verify();
    queryMock.verify();
    res.body.should.deepEqual({
      value: books
    });
  });
  it('should select multiple field', async function() {
    const books = data.map(item => ({
      price: item.price,
      title: item.title
    }));

    modelMock = sinon.mock(BookModel);
    queryMock = sinon.mock(query);
    modelMock.expects('find').returns(query);
    queryMock.expects('select').once().withArgs({
      _id: 0,
      price: 1,
      title: 1
    });
    queryMock.expects('exec').once().callsArgWith(0, null, books.map(item => ({ toObject: () => item })));

    const res = await request(host).get('/book?$select=price,title');

    assertSuccess(res);
    modelMock.verify();
    queryMock.verify();
    res.body.should.deepEqual({
      value: books
    });
  });
  it('should select multiple field with blank space', async function() {
    const books = data.map(item => ({
      price: item.price,
      title: item.title
    }));

    modelMock = sinon.mock(BookModel);
    queryMock = sinon.mock(query);
    modelMock.expects('find').returns(query);
    queryMock.expects('select').once().withArgs({
      _id: 0,
      price: 1,
      title: 1
    });
    queryMock.expects('exec').once().callsArgWith(0, null, books.map(item => ({ toObject: () => item })));

    const res = await request(host).get('/book?$select=price,   title');

    assertSuccess(res);
    modelMock.verify();
    queryMock.verify();
    res.body.should.deepEqual({
      value: books
    });
  });
  it('should select id field', async function() {
    const books = data.map(item => ({
      price: item.price,
      title: item.title,
      id: item.id
    }));

    modelMock = sinon.mock(BookModel);
    queryMock = sinon.mock(query);
    modelMock.expects('find').returns(query);
    queryMock.expects('select').once().withArgs({
      _id: 1,
      price: 1,
      title: 1
    });
    queryMock.expects('exec').once().callsArgWith(0, null, books.map(item => ({ toObject: () => item })));

    const res = await request(host).get('/book?$select=price,title,id');

    assertSuccess(res);
    modelMock.verify();
    queryMock.verify();
    res.body.should.deepEqual({
      value: books
    });
  });
  it('should ignore when select not exist field', async function() {
    modelMock = sinon.mock(BookModel);
    modelMock.expects('find').never();

    const res = await request(host).get('/book?$select=not-exist-field');

    modelMock.verify();
    res.status.should.be.equal(400);
  });
});
