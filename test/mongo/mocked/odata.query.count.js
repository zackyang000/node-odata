import 'should';
import sinon from 'sinon';
import request from 'supertest';
import { odata, host, port, assertSuccess } from '../../support/setup';
import books from '../../support/books.json';
import { init } from '../../support/db';
import { BookModel } from '../../support/books.model';

describe('odata.query.count', function () {
  const query = {
    count: () => { },
    exec: () => { },
    model: BookModel
  };
  let httpServer, modelMock, queryMock;

  before(async function () {
    const server = odata();
    server.mongoEntity('book', BookModel);
    init(server);
    httpServer = server.listen(port);
  });

  after(() => {
    httpServer.close();
  });

  afterEach(() => {
    modelMock.restore();
    queryMock?.restore();
  });

  it('should get count', async function () {
    modelMock = sinon.mock(BookModel);
    queryMock = sinon.mock(query);
    modelMock.expects('find').twice().returns(query);
    queryMock.expects('count').once().callsArgWith(0, null, 13);
    queryMock.expects('exec').once().callsArgWith(0, null, books.map(item => ({ toObject: () => item })));

    const res = await request(host).get('/book?$count=true');
    assertSuccess(res);
    res.body.should.be.have.property('@odata.count');
    res.body.should.be.have.property('value');
    res.body['@odata.count'].should.be.equal(res.body.value.length.toString());

    modelMock.verify();
    queryMock.verify();
  });
  it('should not get count', async function () {
    modelMock = sinon.mock(BookModel);
    queryMock = sinon.mock(query);
    modelMock.expects('find').twice().returns(query);
    queryMock.expects('exec').once().callsArgWith(0, null, books.map(item => ({ toObject: () => item })));

    const res = await request(host).get('/book?$count=false');
    res.body.should.be.not.have.property('@odata.count');
  });
  it('should 500 when $count isn\'t \'true\' or \'false\'', async function () {
    const res = await request(host).get('/book?$count=1');
    res.error.status.should.be.equal(500);
  });

});
