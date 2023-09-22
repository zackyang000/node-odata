import 'should';
import request from 'supertest';
import { odata, host, port, assertSuccess } from './support/setup';

// https://sapui5.hana.ondemand.com/sdk/#/topic/fbe1cb5613cf4a40a841750bf813238e.html

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

  it('should return message header', async function () {
    server.action('server-message', (req, res, next) => {
        try {
          res.$odata.messages.push({
            code: '0815',
            message: 'Some message',
            numericSeverity: 1 // 1 - success, 2 - info, 3 - warning, 4 - error
          });
          res.$odata.status = 204;
          next();

        } catch (error) {
          next(error);
        }
      });
    httpServer = server.listen(port);

    const res = await request(host).post(`/node.odata.server-message`)

    assertSuccess(res);
    res.headers.should.have.property('sap-messages');
    JSON.parse(res.headers['sap-messages']).should.deepEqual([{
      code: '0815',
      message: 'Some message',
      numericSeverity: 1
    }]);
  });

  it('should fail if code missing', async function () {
    server.action('server-message', (req, res, next) => {
        try {
          res.$odata.messages.push({
            message: 'Some message',
            numericSeverity: 1 // 1 - success, 2 - info, 3 - warning, 4 - error
          });
          res.$odata.status = 204;
          next();

        } catch (error) {
          next(error);
        }
      });
    httpServer = server.listen(port);

    const res = await request(host).post(`/node.odata.server-message`)

    res.status.should.be.equal(500);
    res.res.statusMessage.should.be.equal('Internal Server Error');
    res.body.should.deepEqual({
      error: {
        code: "500",
        message: "Internal Server Error"    
      }
    
    });
  });

  it('should fail if message property missing', async function () {
    server.action('server-message', (req, res, next) => {
        try {
          res.$odata.messages.push({
            code: '0815',
            numericSeverity: 1 // 1 - success, 2 - info, 3 - warning, 4 - error
          });
          res.$odata.status = 204;
          next();

        } catch (error) {
          next(error);
        }
      });
    httpServer = server.listen(port);

    const res = await request(host).post(`/node.odata.server-message`)

    res.status.should.be.equal(500);
    res.res.statusMessage.should.be.equal('Internal Server Error');
    res.body.should.deepEqual({
      error: {
        code: "500",
        message: "Internal Server Error"    
      }
    
    });
  });

  it('should fail if severity property not given', async function () {
    server.action('server-message', (req, res, next) => {
        try {
          res.$odata.messages.push({
            code: '0815',
            message: 'Some message'
          });
          res.$odata.status = 204;
          next();

        } catch (error) {
          next(error);
        }
      });
    httpServer = server.listen(port);

    const res = await request(host).post(`/node.odata.server-message`)

    res.status.should.be.equal(500);
    res.res.statusMessage.should.be.equal('Internal Server Error');
    res.body.should.deepEqual({
      error: {
        code: "500",
        message: "Internal Server Error"    
      }
    
    });
  });
  it('should fail if invalid severity given', async function () {
    server.action('server-message', (req, res, next) => {
        try {
          res.$odata.messages.push({
            code: '0815',
            message: 'Some message',
            numericSeverity: 99
          });
          res.$odata.status = 204;
          next();

        } catch (error) {
          next(error);
        }
      });
    httpServer = server.listen(port);

    const res = await request(host).post(`/node.odata.server-message`)

    res.status.should.be.equal(500);
    res.res.statusMessage.should.be.equal('Internal Server Error');
    res.body.should.deepEqual({
      error: {
        code: "500",
        message: "Internal Server Error"    
      }
    
    });
  });
});
