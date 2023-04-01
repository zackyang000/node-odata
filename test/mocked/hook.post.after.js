import 'should';
import 'should-sinon';
import request from 'supertest';
import sinon from 'sinon';
import { odata, host, port, bookSchema } from '../support/setup';
import FakeDb from '../support/fake-db';
import books from '../support/books.json';

describe('hook.post.after', function() {
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
    const TITLE = 'HOOK_POST_AFTER';
    
    server.resources.book.post().after((entity) => {
      entity.should.be.have.property('title');
      entity.title.should.be.equal(TITLE);
      callback();
    });
    httpServer = server.listen(port);
    await request(host).post(`/book`).send({ title: TITLE });
    callback.should.be.called();
  });
  it('should work with multiple hooks', async function() {
    const callback = sinon.spy();
    const TITLE = 'HOOK_POST_AFTER';
    
    server.resources.book.post().after(callback).after(callback);
    httpServer = server.listen(port);
    await request(host).post(`/book`).send({ title: TITLE });
    callback.should.be.calledTwice();
  });
});


