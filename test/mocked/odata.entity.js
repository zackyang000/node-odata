import 'should';
import request from 'supertest';
import { odata, host, port, bookSchema } from '../support/setup';
import data from '../support/books.json';
import FakeDb from '../support/fake-db';

describe('odata.entity', () => {
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

  it('should work with custom implementation', async function () {
    const result = [{
      "id": '1',
      "price": 44.95,
      "title": "XML Developer's Guide"
    },
    {
      "id": '1',
      "price": 5.95,
      "title": "Midnight Rain"
    }];
    server.entity('book', {
      list: (req, res, next) => {
        res.$odata.result = result;
        next();
      }
    }, {
      $Key: ['id'],
      id: {
        $Type: 'node.odata.ObjectId',
        $Nullable: false
      },
      title: {
        $Type: 'Edm.String'
      },
      price: {
        $Type: 'Edm.Decimal',
        $Precision: 10,
        $Scale: 2
      }
    });
    httpServer = server.listen(port);

    const res = await request(host).get(`/book`);

    if (!res.ok) {
      res.res.statusMessage.should.be.equal('');
    }

    res.body.should.deepEqual(result);
  });



  it('should return 501 for not implemented methods', async function () {
    const result = [{
      "id": '1',
      "price": 44.95,
      "title": "XML Developer's Guide"
    },
    {
      "id": '1',
      "price": 5.95,
      "title": "Midnight Rain"
    }];
    server.entity('book', null, {
      $Key: ['id'],
      id: {
        $Type: 'node.odata.ObjectId',
        $Nullable: false
      },
      title: {
        $Type: 'Edm.String'
      },
      price: {
        $Type: 'Edm.Decimal',
        $Precision: 10,
        $Scale: 2
      }
    });
    httpServer = server.listen(port);

    const res = await request(host).get(`/book`);

    res.res.statusMessage.should.be.equal('Not Implemented');

    res.body.should.deepEqual({ error: { code: '501', message: 'Not Implemented' } });
  });

});
