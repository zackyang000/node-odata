import 'should';
import sinon from 'sinon';
import request from 'supertest';
import { odata, host, port } from '../../support/setup';
import { init } from '../../support/db';
import { BookModel } from '../../support/books.model';

describe('mongo.mocked.odata.count', function() {
  let httpServer, modelMock, queryMock;

  before(async function() {
    const server = odata();
    server.mongoEntity('book', BookModel);
    init(server);

    httpServer = server.listen(port);
  });

  after(() => {
    httpServer.close();
    modelMock.restore();
    queryMock?.restore();
  });

  it('should get count for entity set', async function() {
    const query = {
      count: () => { },
      model: BookModel
    };
    modelMock = sinon.mock(BookModel);
    queryMock = sinon.mock(query);
    modelMock.expects('find').once().returns(query);
    queryMock.expects('count').once()
      .returns(new Promise(resolve => resolve(13)));

    const res = await request(host).get('/book/$count');

    if (res.error) {
      res.error.status.should.be.equal(200);
    }
    res.text.should.be.equal('13');
    res.header.should.have.property('content-type');
    res.header['content-type'].should.containEql('text/plain');

    modelMock.verify();
    queryMock.verify();
  });
});
