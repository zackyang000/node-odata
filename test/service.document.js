import 'should';
import request from 'supertest';
import { host, port, bookSchema, odata, assertSuccess } from './support/setup';
import FakeDb from './support/fake-db';

describe('metadata.format', () => {
  let httpServer, server, db;

  const jsonDocument = {
    '@context': 'http://localhost:8080/',
    value: [{
      kind: 'EntitySet',
      name: 'books',
      url: 'books'
    }]
  }; 
  beforeEach(async function() {
    db = new FakeDb();
    server = odata(db);
    server.resource('book', bookSchema);

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