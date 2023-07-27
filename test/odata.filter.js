import 'should';
import request from 'supertest';
import { odata, host, port, assertSuccess } from './support/setup';
import { BookMetadata } from './support/books.model';

describe('odata.filter', () => {
  let httpServer, server;

  beforeEach(async function () {
    server = odata();
  });

  afterEach(() => {
    if (httpServer) {
      httpServer.close();
    }
  });

  it('should work with single string equals', async function () {
    server.entity('book', {
      list: (req, res, next) => {
        req.$odata.$filter.should.deepEqual({ title: { $eq: 'Midnight Rain' } });
        res.$odata.result = { value: [] };
        next();
      }
    }, BookMetadata);
    httpServer = server.listen(port);

    const res = await request(host).get(`/book?$filter=title eq 'Midnight Rain'`);

    assertSuccess(res);

  });

  it('should work with single $lt operator', async function () {
    server.entity('book', {
      list: (req, res, next) => {
        req.$odata.$filter.should.deepEqual({ price: { $lt: 5.95 } });
        res.$odata.result = { value: [] };
        next();
      }
    }, BookMetadata);
    httpServer = server.listen(port);

    const res = await request(host).get(`/book?$filter=price lt 5.95`);

    assertSuccess(res);

  });

  it('should work with single $ge operator', async function () {
    server.entity('book', {
      list: (req, res, next) => {
        req.$odata.$filter.should.deepEqual({ price: { $gte: 5.95 } });
        res.$odata.result = { value: [] };
        next();
      }
    }, BookMetadata);
    httpServer = server.listen(port);

    const res = await request(host).get(`/book?$filter=price ge 5.95`);

    assertSuccess(res);

  });

  it('should work with single $le operator', async function () {
    server.entity('book', {
      list: (req, res, next) => {
        req.$odata.$filter.should.deepEqual({ price: { $lte: 5.95 } });
        res.$odata.result = { value: [] };
        next();
      }
    }, BookMetadata);
    httpServer = server.listen(port);

    const res = await request(host).get(`/book?$filter=price le 5.95`);

    assertSuccess(res);

  });

  it(`should work with 'and' and two conditions on same property`, async function () {
    server.entity('book', {
      list: (req, res, next) => {
        req.$odata.$filter.should.deepEqual({ 
          price: { 
            $lte: 5.95,
            $gte: 4
          }
        });
        res.$odata.result = { value: [] };
        next();
      }
    }, BookMetadata);
    httpServer = server.listen(port);

    const res = await request(host).get(`/book?$filter=price le 5.95 and price ge 4`);

    assertSuccess(res);

  });

  //TODO: Weitere Beispiele https://masteringjs.io/tutorials/mongoose/find
});
