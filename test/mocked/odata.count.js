import 'should';
import request from 'supertest';
import { odata, host, port, bookSchema } from '../support/setup';
import books from '../support/books.json';
import FakeDb from '../support/fake-db';

describe('odata.count', function() {
  let httpServer;

  before(async function() {
    const db = new FakeDb();
    const server = odata(db);
    server.resource('book', bookSchema);
    db.addData('book', books);
    httpServer = server.listen(port);
  });

  after(() => {
    httpServer.close();
  });

  it('should get count for entity set', async function() {
    const res = await request(host).get('/book/$count');

    if (res.error) {
      res.error.status.should.be.equal(200);
    }
    res.text.should.be.equal('13');
    res.header.should.have.property('content-type');
    res.header['content-type'].should.containEql('text/plain');
  });
});
