import 'should';
import sinon from 'sinon';
import request from 'supertest';
import { odata, host, port, assertSuccess } from './support/setup';
import { BookMetadata } from './support/books.model';

describe('options.maxTop', () => {
  let httpServer, server;

  beforeEach(async function() {
    server = odata();
  });

  afterEach(() => {
    httpServer.close();
  });

  it('global-limit should work', async function() {
    server.entity('book', {
      list: (req, res, next) => {
        res.$odata.result = [];
        res.$odata.status = 200;
        req.$odata.$top.should.be.equal(1);
        next();
      }
    }, BookMetadata);
    server.set('maxTop', 1);
    httpServer = server.listen(port);

    const res = await request(host).get('/book?$top=100');

    assertSuccess(res);
  });
  it('resource-limit should work', async function() {
    const entity = server.entity('book', {
      list: (req, res, next) => {
        res.$odata.result = [];
        res.$odata.status = 200;
        req.$odata.$top.should.be.equal(1);
        next();
      }
    }, BookMetadata);
    entity.set('maxTop', 1);
    httpServer = server.listen(port);

    const res = await request(host).get('/book?$top=2');
    
    assertSuccess(res);
  });
  it('should use resource-limit even global-limit already set', async function() {
    const entity = server.entity('book', {
      list: (req, res, next) => {
        res.$odata.result = [];
        res.$odata.status = 200;
        req.$odata.$top.should.be.equal(1);
        next();
      }
    }, BookMetadata);
    server.set('maxTop', 2);
    entity.set('maxTop', 1);
    httpServer = server.listen(port);

    const res = await request(host).get('/book?$top=100');

    assertSuccess(res);
  });
  it('should use query-limit if it is minimum global-limit', async function() {
    const entity = server.entity('book', {
      list: (req, res, next) => {
        res.$odata.result = [];
        res.$odata.status = 200;
        req.$odata.$top.should.be.equal(1);
        next();
      }
    }, BookMetadata);
    server.set('maxTop', 2);
    httpServer = server.listen(port);

    const res = await request(host).get('/book?$top=1');

    assertSuccess(res);
  });
  it('should use query-limit if it is minimum resource-limit', async function() {
    const entity = server.entity('book', {
      list: (req, res, next) => {
        res.$odata.result = [];
        res.$odata.status = 200;
        req.$odata.$top.should.be.equal(1);
        next();
      }
    }, BookMetadata);
    entity.set('maxTop', 2);
    httpServer = server.listen(port);

    const res = await request(host).get('/book?$top=1');

    assertSuccess(res);
  });
});
