import 'should';
import request from 'supertest';
import { host, port, odata, assertSuccess } from './support/setup';
import { BookMetadata } from './support/books.model';

describe('service.document', () => {
  let httpServer, server, db;

  const jsonDocument = {
    '@context': 'http://localhost:3000/$metadata',
    value: [{
      kind: 'EntitySet',
      name: 'book',
      url: 'book'
    }]
  }; 
  beforeEach(async function() {
    server = odata();
    server.entity('book', null, BookMetadata);

  });

  afterEach(() => {
    httpServer.close();
  });

  it('should return json if no format given', async function() {
    httpServer = server.listen(port);
    const res = await request(host).get('/');
    assertSuccess(res);
    checkContentType(res, 'application/json');
    res.body.should.deepEqual(jsonDocument);
  });

  it('should return json if asterix pattern match', async function() {
    httpServer = server.listen(port);
    const res = await request(host).get('/').set('accept', '*/*');
    assertSuccess(res);
    checkContentType(res, 'application/json');
    res.body.should.deepEqual(jsonDocument);
  });

  it('should return 406 if other than json format requested', async function() {
    httpServer = server.listen(port);
    const res = await request(host).get('/').set('accept', 'application/xml');
    res.status.should.be.equal(406);
  });

});


function checkContentType(res, value) {
  res.header.should.have.property('content-type');
  res.header['content-type'].should.containEql(value);
}