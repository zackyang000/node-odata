import 'should';
import request from 'supertest';
import { odata, conn, host, port, bookSchema, initData } from '../support/setup';

describe('hook.get.after', function() {
  let data, httpServer, server;

  beforeEach(async function() {
    data = await initData();
    server = odata(conn);
  });

  afterEach(() => {
    httpServer.close();
  });

  it('should work', function(done) {
    server.resource('book', bookSchema).get().after((entity) => {
      entity.should.be.have.property('title');
      done();
    });
    httpServer = server.listen(port);
    request(host).get(`/book(${data[0].id})`).end();
  });
  it('should work with multiple hooks', function(done) {
    let doneTwice = () => doneTwice = done;
    server.resource('book', bookSchema).get().after(() => doneTwice()).after(() => doneTwice());
    httpServer = server.listen(port);
    request(host).get(`/book(${data[0].id})`).end();
  });
});
