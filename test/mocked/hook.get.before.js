import 'should';
import 'should-sinon';
import request from 'supertest';
import sinon from 'sinon';
import { host, port, bookSchema, odata } from '../support/setup';
import FakeDb from '../support/fake-db';
import books from '../support/books.json';

describe('hook.get.before', function() {
  let data, httpServer, server, db;

  beforeEach(async function() {
    db = new FakeDb();
    server = odata(db);
    server.resource('book', bookSchema);

    data = db.addData('book', books);
  });

  afterEach(() => {
    httpServer.close();
  });

  it('should work', async function() {
    const callback = sinon.spy();
    
    server.resources.book.get().before((entity, req) => {
      req.params.should.be.have.property('id');
      req.params.id.should.be.equal(data[0].id);
      callback();
    });
    httpServer = server.listen(port);
    await request(host).get(`/book(${data[0].id})`);
    callback.should.be.called();
  });
  it('should work with multiple hooks', async function() {
    const callback = sinon.spy();
    
    server.resources.book.get().before(callback).before(callback);
    httpServer = server.listen(port);
    await request(host).get(`/book(${data[0].id})`);
    callback.should.be.calledTwice();
  });
});
