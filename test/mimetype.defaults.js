import 'should';
import request from 'supertest';
import { host, port, odata, assertSuccess } from './support/setup';
import { BookMetadata } from './support/books.model';

describe('mimetype.defaults', () => {
  let httpServer, server;

  beforeEach(async function() {
    server = odata();
    server.entity('book', {
      list: (req, res, next) => {
        res.$odata.result = {
          value: []
        };
        next();
      }
    }, BookMetadata);

  });

  afterEach(() => {
    httpServer.close();
  });

  it('should return xml if no format given for metadata request', async function() {
    httpServer = server.listen(port);
    const res = await request(host).get('/$metadata');
    assertSuccess(res);
    checkContentType(res, 'application/xml');
  });

  it('should return json if no format given for data request', async function() {
    httpServer = server.listen(port);
    const res = await request(host).get('/book');
    assertSuccess(res);
    checkContentType(res, 'application/json');
  });
});


function checkContentType(res, value) {
  res.header.should.have.property('content-type');
  res.header['content-type'].should.containEql(value);
}