import 'should';
import 'should-sinon';
import request from 'supertest';
import sinon from 'sinon';
import { odata, conn, host, port, bookSchema, initData } from './support/setup';

describe('hook.put.before', function() {
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
    server.resource('book', bookSchema).put().before((entity, req) => {
      req.params.should.be.have.property('id');
      req.params.id.should.be.equal(data[0].id);
      callback();
    });
    httpServer = server.listen(port);
    await request(host).put(`/book(${data[0].id})`).send(data[0]);
    callback.should.be.called();
  });
  it('should work with multiple hooks', async function() {
    const callback = sinon.spy();
    server.resource('book', bookSchema).put().before(callback).before(callback);
    httpServer = server.listen(port);
    await request(host).put(`/book(${data[0].id})`).send(data[0]);
    callback.should.be.calledTwice();
  });
});
