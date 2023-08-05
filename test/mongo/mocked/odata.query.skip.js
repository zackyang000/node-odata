import 'should';
import sinon from 'sinon';
import request from 'supertest';
import { odata, host, port, assertSuccess } from '../../support/setup';
import { BookModel } from '../../support/books.model';
import data from '../../support/books.json';

describe('mongo.mocked.odata.query.skip', () => {
  const query = {
    $where: () => { },
    where: () => { },
    skip: () => { },
    select: () => { },
    sort: () => { },
    exec: () => { },
    model: BookModel
  };
  let httpServer, modelMock, queryMock;

  before(async function() {
    const server = odata();
    
    server.mongoEntity('book', BookModel)
    httpServer = server.listen(port);

  });

  after(() => {
    httpServer.close();
  });

  afterEach(() => {
    modelMock?.restore();
    queryMock?.restore();
  });

  it('should skip items', async function() {
    modelMock = sinon.mock(BookModel);
    queryMock = sinon.mock(query);
    modelMock.expects('find').returns(query);
    queryMock.expects('skip').once().withArgs(1);
    queryMock.expects('exec').once()
      .returns(new Promise(resolve => resolve(data.map(item => ({ toObject: () => item })))));

    const res = await request(host).get('/book?$skip=1');

    assertSuccess(res);
    modelMock.verify();
    queryMock.verify();
  });
  it('should ignore when skip over count of items', async function() {
    modelMock = sinon.mock(BookModel);
    queryMock = sinon.mock(query);
    modelMock.expects('find').returns(query);
    queryMock.expects('skip').once().withArgs(1024);
    queryMock.expects('exec').once()
      .returns(new Promise(resolve => resolve(data.map(item => ({ toObject: () => item })))));

    const res = await request(host).get('/book?$skip=1024');

    assertSuccess(res);
    modelMock.verify();
    queryMock.verify();
  });
  it('should ignore when skip not a number', async function() {
    modelMock = sinon.mock(BookModel);
    modelMock.expects('find').never();

    const res = await request(host).get('/book?$skip=not-a-number');

    modelMock.verify();
    res.status.should.be.equal(400);
  });
  return it('should ignore when skip not a positive number', async function() {
    modelMock = sinon.mock(BookModel);
    modelMock.expects('find').never();

    const res = await request(host).get('/book?$skip=-1');

    modelMock.verify();
    res.status.should.be.equal(400);
  });
});
