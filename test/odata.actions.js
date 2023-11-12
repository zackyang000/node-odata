import 'should';
import request from 'supertest';
import { odata, host, port, assertSuccess } from './support/setup';
import { BookMetadata } from './support/books.model';
import should from 'should';

function requestToHalfPrice(id) {
  return request(host).post(`/book('${id}')/50off`);
}

describe('odata.actions', () => {
  let httpServer, server;

  beforeEach(async function () {
    server = odata();
  });

  afterEach(() => {
    if (httpServer) {
      httpServer.close();
    }
  });

  it('should work with bound action', async function () {
    server.entity('book', undefined, BookMetadata)
      .action('50off', (req, res, next) => {
        res.$odata.status = 200;
        res.$odata.result = {};
        req.$odata.$Key.id.should.be.equal('AFFE');
        next();
      }, {
        binding: 'entity'
      });
    httpServer = server.listen(port);

    const res = await requestToHalfPrice('AFFE');
    assertSuccess(res);
  });

  it('should work with unbound action', async function () {
    server.action('salam-aleikum', async (req, res) => {
      res.$odata.result = { result: 'Wa aleikum assalam' };
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
      res.$odata.result = { result: 'Wa aleikum assalam' };
    })
    httpServer = server.listen(port);

    const res = await request(host).post(`/salam-aleikum`);

    res.res.statusMessage.should.be.equal('Not Found');

  });

  it('should throw error for not supported option', async function () {
    should(() => {
      server.action('salam-aleikum', async (req, res) => {
        res.$odata.result = { result: 'Wa aleikum assalam' };
      }, {
        unsupportedOption: true
      });
    }).throw(`Option 'unsupportedOption' is not supported`);

  });

  it('should work with complex parameters', async function () {
    const name = {
      first: 'Max',
      last: 'Mustermann'
    };

    server.complexType('fullName', {
      first: {
        $Type: 'Edm.String'
      },
      last: {
        $Type: 'Edm.String'
      }
    });
    server.action('someThing', async (req, res) => {
      req.$odata.$Parameter.should.have.property('name');
      req.$odata.$Parameter.name.should.deepEqual(name)
      res.$odata.status = 204;
    }, {
      $Parameter: [{
        $Name: 'name',
        $Type: 'node.odata.fullName'
      }]
    })
    httpServer = server.listen(port);

    const res = await request(host).post(`/node.odata.someThing`).send({name});

    assertSuccess(res);
    res.status.should.be.equal(204);

  });
});
