import 'should';
import sinon from 'sinon';
import request from 'supertest';
import { odata, host, port, books, bookSchema } from './support/setup';
import FakeDb from './support/fake-db';

describe('odata.query.skip', () => {
  let httpServer, mock, resource;

  before(async function() {
    const db = new FakeDb();
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

  it('should skip items', async function() {
    mock = sinon.mock(resource.model);
    mock.expects('skip').once().withArgs(1).returns(resource.model);
    await request(host).get('/book?$skip=1');
    mock.verify();
  });
  it('should ignore when skip over count of items', async function() {
    mock = sinon.mock(resource.model);
    mock.expects('skip').once().withArgs(1024).returns(resource.model);
    await request(host).get('/book?$skip=1024');
    mock.verify();
  });
  it('should ignore when skip not a number', async function() {
    mock = sinon.mock(resource.model);
    mock.expects('skip').never();
    await request(host).get('/book?$skip=not-a-number');
    mock.verify();
  });
  return it('should ignore when skip not a positive number', async function() {
    mock = sinon.mock(resource.model);
    mock.expects('skip').never();
    await request(host).get('/book?$skip=-1');
    mock.verify();
  });
});
