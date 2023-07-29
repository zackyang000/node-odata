import 'should';
import request from 'supertest';
import { odata, host, port, assertSuccess } from '../../support/setup';
import { BookModel } from '../../support/books.model';
import sinon from 'sinon';

describe('rest.delete', function() {
  let httpServer, modelMock;

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
  });

  it('should delete resource if it exist', async function() {
    modelMock = sinon.mock(BookModel);
    modelMock.expects('remove').once().withArgs({_id: '1'})
      .callsArgWith(1, null, JSON.stringify({n:1}));

    const res = await request(host).del(`/book('1')`);

    assertSuccess(res);
    res.status.should.be.equal(204);
    modelMock.verify();
  });
  it('should be 404 if resource not exist', async function() {
    modelMock = sinon.mock(BookModel);
    modelMock.expects('remove').once().withArgs({_id: '666'})
      .callsArgWith(1, null, JSON.stringify({n:0}));

    const res = await request(host).del(`/book('666')`);

    res.status.should.be.equal(404);
    modelMock.verify();
  });
  it('should be 404 if without id', async function() {
    const res = await request(host).del(`/book`);

    res.status.should.be.equal(404);
  });
});
