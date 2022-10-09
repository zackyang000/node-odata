import 'should';
import sinon from 'sinon';
import request from 'supertest';
import { odata, host, port, bookSchema } from './support/setup';
import FakeDb from './support/fake-db';

describe('options.maxTop', () => {
  let httpServer, server, resource, mock;

  beforeEach(async function() {
    const db = new FakeDb();
    server = odata(db);
    resource = server.resource('book', bookSchema);
  });

  afterEach(() => {
    httpServer.close();
    mock.restore();
  });

  it('global-limit should work', async function() {
    mock = sinon.mock(resource.model);
    mock.expects('limit').once().withArgs(1).returns(resource.model);
    server.set('maxTop', 1);
    httpServer = server.listen(port);
    await request(host).get('/book?$top=100');
    mock.verify();
  });
  it('resource-limit should work', async function() {
    mock = sinon.mock(resource.model);
    mock.expects('limit').once().withArgs(1).returns(resource.model);
    resource.maxTop(1);
    httpServer = server.listen(port);
    await request(host).get('/book?$top=2');
    mock.verify();
  });
  it('should use resource-limit even global-limit already set', async function() {
    mock = sinon.mock(resource.model);
    mock.expects('limit').once().withArgs(1).returns(resource.model);
    server.set('maxTop', 2);
    resource.maxTop(1);
    httpServer = server.listen(port);
    await request(host).get('/book?$top=100');
    mock.verify();
  });
  it('should use query-limit if it is minimum global-limit', async function() {
    mock = sinon.mock(resource.model);
    mock.expects('limit').once().withArgs(1).returns(resource.model);
    server.set('maxTop', 2);
    httpServer = server.listen(port);
    await request(host).get('/book?$top=1');
    mock.verify();
  });
  it('should use query-limit if it is minimum resource-limit', async function() {
    mock = sinon.mock(resource.model);
    mock.expects('limit').once().withArgs(1).returns(resource.model);
    resource.maxTop(2);
    httpServer = server.listen(port);
    await request(host).get('/book?$top=1');
    mock.verify();
  });
});
