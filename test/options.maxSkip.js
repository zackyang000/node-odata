import 'should';
import sinon from 'sinon';
import request from 'supertest';
import { odata, host, port, books, bookSchema } from './support/setup';
import FakeDb from './support/fake-db';

describe('options.maxSkip', () => {
  let httpServer, server, mock, resource;

  beforeEach(async function() {
    const db = new FakeDb();
    server = odata(db);
    resource = server.resource('book', bookSchema);
    db.addData('book', books);
  });

  afterEach(() => {
    httpServer.close();
    mock.restore();
  });

  it('global-limit should work', async function() {
    mock = sinon.mock(resource.model);
    mock.expects('skip').once().withArgs(1).returns(resource.model);
    server.set('maxSkip', 1);
    httpServer = server.listen(port);
    await request(host).get('/book?$skip=100');
    mock.verify();
  });
  it('resource-limit should work', async function() {
    mock = sinon.mock(resource.model);
    mock.expects('skip').once().withArgs(1).returns(resource.model);
    resource.maxSkip(1);
    httpServer = server.listen(port);
    await request(host).get('/book?$skip=100');
    mock.verify();
  });
  it('should use resource-limit even global-limit already set', async function() {
    mock = sinon.mock(resource.model);
    mock.expects('skip').once().withArgs(1).returns(resource.model);
    server.set('maxSkip', 2);
    resource.maxSkip(1);
    httpServer = server.listen(port);
    await request(host).get('/book?$skip=100');
    mock.verify();
  });
  it('should use query-limit if it is minimum global-limit', async function() {
    mock = sinon.mock(resource.model);
    mock.expects('skip').once().withArgs(1).returns(resource.model);
    server.set('maxSkip', 2);
    httpServer = server.listen(port);
    await request(host).get('/book?$skip=1');
    mock.verify();
  });
  it('should use query-limit if it is minimum resource-limit', async function() {
    mock = sinon.mock(resource.model);
    mock.expects('skip').once().withArgs(1).returns(resource.model);
    resource.maxSkip(2);
    httpServer = server.listen(port);
    await request(host).get('/book?$skip=1');
    mock.verify();
  });
});
