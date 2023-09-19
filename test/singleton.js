import 'should';
import request from 'supertest';
import { odata, host, port } from './support/setup';
import { BookMetadata } from './support/books.model';

describe('singleton', () => {
  let httpServer, server;

  beforeEach(async function () {
    server = odata();
  });

  afterEach(() => {
    if (httpServer) {
      httpServer.close();
    }
  });

  it('should work with get', async function () {
    const result = {
      "id": '1',
      "price": 44.95,
      "title": "XML Developer's Guide"
    };
    server.singleton('book', {
      get: (req, res, next) => {
        res.$odata.result = result;
        next();
      }
    }, BookMetadata);
    httpServer = server.listen(port);

    const res = await request(host).get(`/book`);

    if (!res.ok) {
      res.res.statusMessage.should.be.equal('');
    }

    res.body.should.deepEqual(result);
  });

  it('should work if entityset and singleton defined', async function () {
    const result = {
      "id": '1',
      "price": 44.95,
      "title": "XML Developer's Guide"
    };
    const book = server.entity('book', null, BookMetadata);
    server.singletonFrom('current-book', {
      get: (req, res, next) => {
        res.$odata.result = result;
        next();
      }
    }, book);
    httpServer = server.listen(port);

    const res = await request(host).get(`/current-book`);

    if (!res.ok) {
      res.res.statusMessage.should.be.equal('');
    }

    res.body.should.deepEqual(result);
  });
  
});
