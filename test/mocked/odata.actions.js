import 'should';
import request from 'supertest';
import { odata, host, port, bookSchema } from '../support/setup';
import data from '../support/books.json';
import FakeDb from '../support/fake-db';

function requestToHalfPrice(id) {
  return request(host).post(`/book(${id})/50off`);
}

function halfPrice(price) {
  return +(price / 2).toFixed(2);
}

describe('odata.actions', () => {
  let httpServer, books;

  before(async function() {
    const db = new FakeDb();
    const server = odata(db);
    server
    .resource('book', bookSchema)
    .action('/50off', (req, res, next) => {
      server.resources.book.model.findById(req.params.id, (err, book) => {
        book.price = halfPrice(book.price);
        book.save((err) => res.jsonp(book));
      });
    });
    books = JSON.parse( JSON.stringify( db.addData('book', data)));
    httpServer = server.listen(port);
  });

  after(() => {
    httpServer.close();
  });

  it('should work', async function() {
    const item = books[0];
    const res = await requestToHalfPrice(item.id);
    const price = halfPrice(item.price);
    res.body.price.should.be.equal(price);
  });
});
