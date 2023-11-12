import 'should';
import request from 'supertest';
import { odata, host, port, assertSuccess } from './support/setup';

describe('odata.select', () => {
  let httpServer, server;

  beforeEach(async function () {
    server = odata();
  });

  afterEach(() => {
    if (httpServer) {
      httpServer.close();
    }
  });

  it('should work deep property', async function () {
    server.complexType('fullName', {
      first: {
        $Type: 'Edm.String'
      },
      last: {
        $Type: 'Edm.String'
      }
    });
    server.entity('user', {
      list: (req, res, next) => {
        req.$odata.$select.should.deepEqual(['name.first'])
        res.$odata.status = 204;
        next();
      }
    }, {
      $Key: ['id'],
      id: {
        $Type: 'Edm.String',
        $MaxLength: 24,
        $Nullable: true
      },
      name: {
        $Type: 'node.odata.fullName'
      }
    });
    httpServer = server.listen(port);

    const res = await request(host).get(`/user?$select=name/first`);

    assertSuccess(res);
  });

});
