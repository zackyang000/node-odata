import 'should';
import request from 'supertest';
import { host, port, bookSchema, odata, assertSuccess } from './support/setup';
import FakeDb from './support/fake-db';

describe('mimetype.defaults', () => {
  let httpServer, server, db;

  beforeEach(async function() {
    db = new FakeDb();
    server = odata(db);
    server.resource('book', bookSchema);

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