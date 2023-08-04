import 'should';
import sinon from 'sinon';
import request from 'supertest';
import { odata, host, port, assertSuccess } from '../../support/setup';
import data from '../../support/books.json';
import { BookModel } from '../../support/books.model';

describe('mongo.mocked.singleton', () => {
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
    
    server.mongoSingleton('book', BookModel);
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
    modelMock.expects('findOne').once().returns(query);
    queryMock.expects('select').once().withArgs({
      _id: 0,
      price: 1
    });
    queryMock.expects('exec').once()
    .returns(new Promise(resolve => resolve({ toObject: () => books[0] })));

    const res = await request(host).get('/book?$select=price');

    assertSuccess(res);
    modelMock.verify();
    queryMock.verify();
    res.body.should.deepEqual(books[0]);
  });
});
