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

  it('should filter items when it has extra spaces at begin', async function () {
    server.entity('book', {
      list: (req, res, next) => {
        req.$odata.$filter.should.deepEqual({ title: { $eq: 'Midnight Rain' } });
        res.$odata.result = { value: [] };
        next();
      }
    }, BookMetadata);
    httpServer = server.listen(port);

    const res = await request(host).get(`/book?$filter=   title eq 'Midnight Rain'`);

    assertSuccess(res);
  });
  it('should filter items when it has extra spaces at mid', async function () {
    server.entity('book', {
      list: (req, res, next) => {
        req.$odata.$filter.should.deepEqual({ title: { $eq: 'Midnight Rain' } });
        res.$odata.result = { value: [] };
        next();
      }
    }, BookMetadata);
    httpServer = server.listen(port);

    const res = await request(host).get(`/book?$filter=title   eq   'Midnight Rain'`);

    assertSuccess(res);
  });
  it('should filter items when it has extra spaces at end', async function () {
    server.entity('book', {
      list: (req, res, next) => {
        req.$odata.$filter.should.deepEqual({ title: { $eq: 'Midnight Rain' } });
        res.$odata.result = { value: [] };
        next();
      }
    }, BookMetadata);
    httpServer = server.listen(port);

    const res = await request(host).get(`/book?$filter=title eq 'Midnight Rain'   `);

    assertSuccess(res);
  });
  it('should filter items when use chinese keyword', async function () {
    server.entity('book', {
      list: (req, res, next) => {
        req.$odata.$filter.should.deepEqual({ title: { $eq: '代码大全' } });
        res.$odata.result = { value: [] };
        next();
      }
    }, BookMetadata);
    httpServer = server.listen(port);

    const res = await request(host).get(encodeURI(`/book?$filter=title eq '代码大全'`));

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

  it("[and] should filter items when it has extra spaces", async function () {
    server.entity('book', {
      list: (req, res, next) => {
        req.$odata.$filter.should.deepEqual({
          $and: [{
            title: { $ne: 'Midnight Rain' }
          }, {
            price: { $gte: 36.95 },
          }]
        });
        res.$odata.result = { value: [] };
        next();
      }
    }, BookMetadata);
    httpServer = server.listen(port);

    const res = await request(host).get(`/book?$filter=title ne 'Midnight Rain'   and   price ge 36.95`);

    assertSuccess(res);
  });

  it(`should work with 'and' and two conditions on different properties`, async function () {
    server.entity('book', {
      list: (req, res, next) => {
        req.$odata.$filter.should.deepEqual({
          $and: [{
            price: {
              $lte: 5.95
            }
          }, {
            author: {
              $ne: 'Knorr, Stefan'
            }
          }]
        });
        res.$odata.result = { value: [] };
        next();
      }
    }, BookMetadata);
    httpServer = server.listen(port);

    const res = await request(host).get(`/book?$filter=price le 5.95 and author ne 'Knorr, Stefan'`);

    assertSuccess(res);

  });

  it(`should work with 'or'`, async function () {
    server.entity('book', {
      list: (req, res, next) => {
        req.$odata.$filter.should.deepEqual({
          $or: [{
            price: {
              $lte: 5.95
            }
          }, {
            author: {
              $ne: 'Knorr, Stefan'
            }
          }]
        });
        res.$odata.result = { value: [] };
        next();
      }
    }, BookMetadata);
    httpServer = server.listen(port);

    const res = await request(host).get(`/book?$filter=price le 5.95 or author ne 'Knorr, Stefan'`);

    assertSuccess(res);

  });

  it(`should work with 'and' and 'or'`, async function () {
    server.entity('book', {
      list: (req, res, next) => {
        req.$odata.$filter.should.deepEqual({
          $or: [{
            $and: [{
              price: {
                $lte: 5.95
              }
            }, {
              author: {
                $ne: 'Knorr, Stefan'
              }
            }]
          }, {
            $and: [{
              price: {
                $gte: 5.95
              }
            }, {
              author: {
                $eq: 'Knorr, Stefan'
              }
            }]
          }]

        });
        res.$odata.result = { value: [] };
        next();
      }
    }, BookMetadata);
    httpServer = server.listen(port);

    const res = await request(host).get(`/book?$filter=price le 5.95 and author ne 'Knorr, Stefan' or price ge 5.95 and author eq 'Knorr, Stefan'`);

    assertSuccess(res);

  });
  it('should use mapping', async function () {
    const book = server.entity('book', {
      list: (req, res, next) => {
        req.$odata.$filter.should.deepEqual({ _id: { $eq: '2' } });
        res.$odata.result = { value: [] };
        next();
      }
    }, BookMetadata, null);

    book.mapping.id = {
      intern: '_id'
    };
    httpServer = server.listen(port);

    const res = await request(host).get(encodeURI(`/book?$filter=id eq '2'`));

    assertSuccess(res);
  });
});
