import 'should';
import request from 'supertest';
import { host, port, odata, assertSuccess } from '../support/setup';
import { BookMetadata } from '../support/books.model';
import checkContentType from '../support/checkContentType';

describe('service.document.singleton', () => {
  let httpServer, server;

  const jsonDocument = {
    '@context': 'http://localhost:3000/$metadata',
    value: [{
      kind: 'Singleton',
      name: 'book',
      url: 'book'
    }]
  }; 
  beforeEach(async function() {
    server = odata();
    server.singleton('book', null, BookMetadata);

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

});


