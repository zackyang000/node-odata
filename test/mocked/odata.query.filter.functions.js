import 'should';
import sinon from 'sinon';
import request from 'supertest';
import { odata, host, port, bookSchema } from '../support/setup';
import data from '../support/books.json';
import FakeDb from '../support/fake-db';

describe('odata.query.filter.functions', function () {
  let httpServer, mock, resource;

  before(async function () {
    const db = new FakeDb();
    const server = odata(db);
    resource = server.resource('book', bookSchema)
    httpServer = server.listen(port);
    db.addData('book', data);
  });

  after(() => {
    httpServer.close();
  });

  describe('[contains]', () => {
    it('should filter items', async function () {
      mock = sinon.mock(resource.model);
      mock.expects('$where').once().withArgs(`this.title.indexOf('i') != -1`).returns(resource.model);
      await request(host).get(`/book?$filter=contains(title,'i')`);
      mock.verify();
    });
    it('should filter items when it has extra spaces in query string', async function () {
      mock = sinon.mock(resource.model);
      mock.expects('$where').once().withArgs(`this.title.indexOf('Visual Studio') != -1`).returns(resource.model);
      await request(host).get(`/book?$filter=contains(title,'Visual Studio')`);
      mock.verify();
    });
  });

  describe('[indexof]', () => {
    it('should filter items', async function () {
      mock = sinon.mock(resource.model);
      mock.expects('$where').once().withArgs(`this.title.indexOf('i') >= 1`).returns(resource.model);
      await request(host).get(`/book?$filter=indexof(title,'i') ge 1`);
      mock.verify();
    });
    it('should filter items when it has extra spaces in query string', async function () {
      mock = sinon.mock(resource.model);
      mock.expects('$where').once().withArgs(`this.title.indexOf('Visual Studio') >= 0`).returns(resource.model);
      const res = await request(host).get(`/book?$filter=indexof(title,'Visual Studio') ge 0`);
      mock.verify();
    });
  });

  describe('[year]', () => {
    it('should filter items', async function () {
      mock = sinon.mock(resource.model);
      mock.expects('where').once().withArgs(`publish_date`).returns(resource.model);
      mock.expects('gte').once().withArgs(new Date(2000, 0, 1)).returns(resource.model);
      mock.expects('lt').once().withArgs(new Date(2001, 0, 1)).returns(resource.model);
      const res = await request(host).get(`/book?$filter=year(publish_date) eq 2000`);
      mock.verify();
    });
  });
});
