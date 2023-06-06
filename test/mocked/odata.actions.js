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
  let httpServer, server, db;

  beforeEach(async function () {
    db = new FakeDb();
    server = odata(db);
  });

  afterEach(() => {
    if (httpServer) {
      httpServer.close();
    }
  });

  it('should work with bound action', async function () {
    server.resource('book', bookSchema)
      .action('50off', (req, res, next) => {
        req.$odata.mongo.book.findById(req.params.id, (err, book) => {
          book.price = halfPrice(book.price);
          book.save((err) => {
            res.$odata.result = book;
            next();
          });
        });
      }, {
        binding: 'entity'
      });
    const books = JSON.parse(JSON.stringify(db.addData('book', data)));
    httpServer = server.listen(port);
    const item = books[0];

    const res = await requestToHalfPrice(item.id);

    const price = halfPrice(item.price);
    res.body.price.should.be.equal(price);
  });

  it('should work with unbound action', async function () {
    server.action('salam-aleikum', async (req, res) => {
      res.$odata.result = {result: 'Wa aleikum assalam'};
    })
    httpServer = server.listen(port);

    const res = await request(host).post(`/node.odata.salam-aleikum`);

    if (!res.ok) {
      res.res.statusMessage.should.be.equal('');
    }

    res.body.result.should.be.equal('Wa aleikum assalam');
  });

  it('should return 404 for action url without namespace', async function () {
    server.action('salam-aleikum', async (req, res) => {
      res.$odata.result = {result: 'Wa aleikum assalam'};
    })
    httpServer = server.listen(port);

    const res = await request(host).post(`/salam-aleikum`);

    res.res.statusMessage.should.be.equal('Not Found');

  });
});
