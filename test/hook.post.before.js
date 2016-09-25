import 'should';
import 'should-sinon';
import request from 'supertest';
import sinon from 'sinon';
import { odata, conn, host, port, bookSchema, initData } from './support/setup';

describe('hook.post.before', function() {
  let data, httpServer, server;

  beforeEach(async function() {
    data = await initData();
    server = odata(conn);
  });

  afterEach(() => {
    httpServer.close();
  });

  it('should work', async function() {
    const callback = sinon.spy();
    const TITLE = 'HOOK_POST_BEFORE';
    server.resource('book', bookSchema).post().before((entity, req) => {
      req.body.should.be.have.property('title');
      req.body.title.should.be.equal(TITLE);
      callback();
    });
    httpServer = server.listen(port);
    await request(host).post(`/book`).send({ title: TITLE });
    callback.should.be.called();
  });
  it('should work with multiple hooks', async function() {
    const callback = sinon.spy();
    const TITLE = 'HOOK_POST_BEFORE';
    server.resource('book', bookSchema).post().before(callback).before(callback);
    httpServer = server.listen(port);
    await request(host).post(`/book`).send({ title: TITLE });
    callback.should.be.calledTwice();
  });
});


