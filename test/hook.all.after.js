import 'should';
import 'should-sinon';
import request from 'supertest';
import sinon from 'sinon';
import { odata, host, port, bookSchema, assertSuccess } from './support/setup';
import FakeDb from './support/fake-db';
import books from './support/books.json';

describe('hook.all.after', function() {
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
    server.resources.book.all().after((entity) => {
      entity.should.be.have.property('title');
      callback();
    });
    httpServer = server.listen(port);
    const res = await request(host).get(`/book(${data[0].id})`);
    assertSuccess(res);
    callback.should.be.called();
  });

  it('should work with multiple hooks', async function() {
    const callback = sinon.spy();
    server.resources.book.all().after(callback).after(callback);
    httpServer = server.listen(port);
    const res = await request(host).get(`/book(${data[0].id})`);
    assertSuccess(res);
    callback.should.be.calledTwice();
  });
});

