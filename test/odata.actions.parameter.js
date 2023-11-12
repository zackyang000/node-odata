import 'should';
import request from 'supertest';
import { odata, host, port } from './support/setup';

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


  it('should parse given parameter', async function () {
    const parameter = {
      newPassword: 'All parameters given',
      repeat: 'Content is everything, but not yet'
    };

    server.action('change-password', (req, res, next) => {
      req.$odata.$Parameter.should.deepEqual(parameter);
      res.$odata.status = 204;
      next();
    }, {
      $Parameter: [{
        $Type: 'Edm.String',
        $Name: 'newPassword'
      }, {
        $Type: 'Edm.String',
        $Name: 'repeat'
      }]
    });
    httpServer = server.listen(port);

    const res = await request(host).post(`/node.odata.change-password`).send(parameter);
    res.statusCode.should.equal(204);
  });

  it('should fail if required parameter is not given', async function () {
    server.action('change-password', (req, res, next) => {
      should.fail(false, true, 'Not aborted although required parameters were not specified');
      next();
    }, {
      $Parameter: [{
        $Type: 'Edm.String',
        $Name: 'newPassword'
      }, {
        $Type: 'Edm.String',
        $Name: 'repeat'
      }]
    });
    httpServer = server.listen(port);

    const res = await request(host).post(`/node.odata.change-password`).send({
      newPassword: 'Not all parameters given'
    });
    res.statusCode.should.equal(400);
    res.body.should.deepEqual({
      error: {
        code: '400',
        message: `Obligatory parameter 'repeat' not given`
      }
    });
  });

});
