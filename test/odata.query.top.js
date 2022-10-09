import 'should';
import sinon from 'sinon';
import request from 'supertest';
import FakeDb from './support/fake-db';
import { odata, host, port, books, bookSchema } from './support/setup';

describe('odata.query.top', () => {
  let httpServer, mock, resource;

  before(async function() {
    const db = new FakeDb()
    const server = odata(db);
    resource = server.resource('book', bookSchema)
    httpServer = server.listen(port);
    db.addData('book', books);
  });

  after(() => {
    httpServer.close();
  });

  afterEach(() => {
    mock.restore();
  });

  it('should top items', async function() {
    mock = sinon.mock(resource.model);
    mock.expects('limit').once().withArgs(1).returns(resource.model);
    const res = await request(host).get('/book?$top=1');
    mock.verify();
  });
  it('should iginre when top not a number', async function() {
    mock = sinon.mock(resource.model);
    mock.expects('limit').never();
    const res = await request(host).get('/book?$top=not-a-number');
    mock.verify();
  });
  it('should ignore when top not a positive number', async function() {
    mock = sinon.mock(resource.model);
    mock.expects('limit').never();
    const res = await request(host).get('/book?$top=-1');
    mock.verify();
  });
});
