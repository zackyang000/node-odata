import 'should';
import request from 'supertest';
import { odata, host, port, assertSuccess } from './support/setup';
import { BookMetadata } from './support/books.model';

describe('options.prefix', () => {
  let httpServer, server;
  function initEntity(server) {
    server.entity('book', {
      list: (req, res, next) => {
        res.$odata.result = [];
        res.$odata.status = 200;
        next();
      }
    }, BookMetadata);
  }

  before(() => {
    server = odata();
    initEntity(server);
  });

  afterEach(() => {
    httpServer.close();
  });

  it('should be work', async function() {
    server.set('prefix', '/api');
    httpServer = server.listen(port);

    const res = await request(host).get('/api/book');
    
    assertSuccess(res);
  });
  it('should be 200 when do not add `/`', async function() {
    server.set('prefix', 'api');
    httpServer = server.listen(port);

    const res = await request(host).get('/api/book');

    assertSuccess(res);
  });
  it('should be 200 when set it at init-function', async function() {
    server = odata('/api');
    initEntity(server);
    httpServer = server.listen(port);

    const res = await request(host).get('/api/book');

    assertSuccess(res);
  });
});
