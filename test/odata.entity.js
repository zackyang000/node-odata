import 'should';
import request from 'supertest';
import { odata, host, port, assertSuccess } from './support/setup';

describe('odata.entity', () => {
  let httpServer, server;

  beforeEach(async function () {
    server = odata();
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
        res.$odata.result = {
          value: result
        };
        next();
      }
    }, {
      $Key: ['id'],
      id: {
        $Type: 'Edm.String',
        $MaxLength: 24
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

    res.body.should.deepEqual({
      value: result
    });
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
        $Type: 'Edm.String',
        $MaxLength: 24
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

  it('should return datetimeoffsets without milliseconds', async function () {
    server.entity('book', {
      get: (req, res, next) => {
        res.$odata.result = {
          "id": '1',
          "createdAt": new Date(Date.parse("2019-01-01T00:00:00.000Z"))
        };
        next();
      }
    }, {
      $Key: ['id'],
      id: {
        $Type: 'Edm.String',
        $MaxLength: 24
      },
      createdAt: {
        $Type: 'Edm.DateTimeOffset'
      }
    });
    httpServer = server.listen(port);

    const res = await request(host).get(`/book('1')`);

    res.body.should.deepEqual({
      "id": '1',
      "createdAt": "2019-01-01T00:00:00Z"
    });
  });

  it('should return null for nullable values automatically', async function () {
    server.entity('book', {
      get: (req, res, next) => {
        res.$odata.result = {
          "id": '1'
        };
        next();
      }
    }, {
      $Key: ['id'],
      id: {
        $Type: 'Edm.String',
        $MaxLength: 24
      },
      createdAt: {
        $Type: 'Edm.DateTimeOffset',
        $Nullable: true
      }
    });
    httpServer = server.listen(port);

    const res = await request(host).get(`/book('1')`);

    res.body.should.deepEqual({
      "id": '1',
      "createdAt": null
    });
  });

});
