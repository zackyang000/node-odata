import 'should';
import sinon from 'sinon';
import request from 'supertest';
import { odata, host, port, assertSuccess } from '../../support/setup';
import data from '../../support/books.json';
import { BookModel } from '../../support/books.model';

describe('odata.query.orderby', () => {
  const query = {
    $where: () => { },
    where: () => { },
    equals: () => { },
    gte: () => { },
    sort: () => { },
    exec: () => { },
    model: BookModel
  };
  let httpServer, modelMock, queryMock;
  const dataIsolated = JSON.parse(JSON.stringify(data));

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

  it('should default let items order with asc', async function() {
    const books = dataIsolated.sort((a, b) => a.price - b.price);

    modelMock = sinon.mock(BookModel);
    queryMock = sinon.mock(query);
    modelMock.expects('find').returns(query);
    queryMock.expects('sort').once().withArgs([['price', 'asc']]);
    queryMock.expects('exec').once().callsArgWith(0, null, books.map(item => ({ toObject: () => item })));

    const res = await request(host).get('/book?$orderby=price');

    assertSuccess(res);
    modelMock.verify();
    queryMock.verify();
    res.body.should.deepEqual({
      value: books
    });
  });

  it('should let items order asc', async function() {
    const books = dataIsolated.sort((a, b) => a.price - b.price);

    modelMock = sinon.mock(BookModel);
    queryMock = sinon.mock(query);
    modelMock.expects('find').returns(query);
    queryMock.expects('sort').once().withArgs([['price', 'asc']]);
    queryMock.expects('exec').once().callsArgWith(0, null, books.map(item => ({ toObject: () => item })));

    const res = await request(host).get('/book?$orderby=price asc');

    assertSuccess(res);
    modelMock.verify();
    queryMock.verify();
    res.body.should.deepEqual({
      value: books
    });
  });

  it('should let items order desc', async function() {
    const books = dataIsolated.sort((a, b) => b.price - a.price);

    modelMock = sinon.mock(BookModel);
    queryMock = sinon.mock(query);
    modelMock.expects('find').returns(query);
    queryMock.expects('sort').once().withArgs([['price', 'desc']]);
    queryMock.expects('exec').once().callsArgWith(0, null, books.map(item => ({ toObject: () => item })));

    const res = await request(host).get('/book?$orderby=price desc');

    assertSuccess(res);
    modelMock.verify();
    queryMock.verify();
    res.body.should.deepEqual({
      value: books
    });
  });

  it('should let items order when use multiple fields', async function() {
    const books = dataIsolated.sort((a, b) => {
      const result = a.price - b.price;

      if (!result) {
        return a.title - b.title;
      }

      return result;
    });

    modelMock = sinon.mock(BookModel);
    queryMock = sinon.mock(query);
    modelMock.expects('find').returns(query);
    queryMock.expects('sort').once().withArgs([['price', 'asc'], ['title', 'asc']]);
    queryMock.expects('exec').once().callsArgWith(0, null, books.map(item => ({ toObject: () => item })));

    const res = await request(host).get('/book?$orderby=price,title');

    assertSuccess(res);
    modelMock.verify();
    queryMock.verify();
    res.body.should.deepEqual({
      value: books
    });
  });

  it("should fail by not exist field", async function() {
    modelMock = sinon.mock(BookModel);
    modelMock.expects('find').never();

    const res = await request(host).get('/book?$orderby=not-exist-field');

    modelMock.verify();
    res.status.should.be.equal(400);
  });
});
