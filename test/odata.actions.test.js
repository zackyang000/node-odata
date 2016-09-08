import 'should';
import request from 'supertest';
import { odata, conn, host, port, bookSchema, initData } from './support/setup';


function requestToHalfPrice(id) {
  return request(host).post(`/book(${id})/50off`);
}

function halfPrice(price) {
  return +(price / 2).toFixed(2);
}

describe('odata.actions', () => {
  let data, httpServer;

  before(async function() {
    data = await initData();
    const server = odata(conn);
    server
    .resource('book', bookSchema)
    .action('/50off', (req, res, next) => {
      server.resources.book.findById(req.params.id, (err, book) => {
        book.price = halfPrice(book.price);
        book.save((err) => res.jsonp(book));
      });
    });
    httpServer = server.listen(port);
  });

  after(() => {
    httpServer.close();
  });

  it('should work', async function() {
    const item = data[0];
    const res = await requestToHalfPrice(item.id);
    const price = halfPrice(item.price);
    res.body.price.should.be.equal(price);
  });
});
