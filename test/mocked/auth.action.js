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

  it('should work with boolean result', async function () {
    server.action('salam-aleikum', (req, res, next) => {
      res.jsonp({result: 'Wa aleikum assalam'})
    }, {auth: () => true});
    httpServer = server.listen(port);

    const res = await request(host).post(`/node.odata.salam-aleikum`);

    if (!res.ok) {
      res.res.statusMessage.should.be.equal('');
    }

    res.body.result.should.be.equal('Wa aleikum assalam');
  });


  it('should fail without authorization', async function () {
    server.action('salam-aleikum', (req, res, next) => {
      res.jsonp({result: 'Wa aleikum assalam'})
    }, {auth: () => false});
    httpServer = server.listen(port);

    const res = await request(host).post(`/node.odata.salam-aleikum`);

    res.res.statusMessage.should.be.equal('Unauthorized');
  });


  it('should work with boolean result asynchron', async function () {
    server.action('salam-aleikum', (req, res, next) => {
      res.jsonp({result: 'Wa aleikum assalam'})
    }, {auth: async () => true});
    httpServer = server.listen(port);

    const res = await request(host).post(`/node.odata.salam-aleikum`);

    if (!res.ok) {
      res.res.statusMessage.should.be.equal('');
    }

    res.body.result.should.be.equal('Wa aleikum assalam');
  });


  it('should fail without authorization asynchron', async function () {
    server.action('salam-aleikum', (req, res, next) => {
      res.jsonp({result: 'Wa aleikum assalam'})
    }, {auth: async () => false});
    httpServer = server.listen(port);

    const res = await request(host).post(`/node.odata.salam-aleikum`);

    res.res.statusMessage.should.be.equal('Unauthorized');
  });
});
