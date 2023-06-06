import 'should';
import request from 'supertest';
import { odata, host, port, bookSchema } from '../support/setup';
import data from '../support/books.json';
import FakeDb from '../support/fake-db';

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

  it('should return odata error object with status 500 if no status given', async function () {
    server.action('server-error', (req, res, next) => {
        throw new Error("This message should not go to client");
      });
    httpServer = server.listen(port);

    const res = await request(host).post(`/node.odata.server-error`)

    res.status.should.be.equal(500);
    res.res.statusMessage.should.be.equal('Internal Server Error');
    res.body.should.deepEqual({
      error: {
        code: "500",
        message: "Internal Server Error"    
      }
    
    });
  });

  it('should not return custom message if status is bigger or equal 500', async function () {
    server.action('server-error', (req, res, next) => {
        const error = new Error("This message should not go to client");

        error.status = 501;
        throw error;
      });
    httpServer = server.listen(port);

    const res = await request(host).post(`/node.odata.server-error`)

    res.status.should.be.equal(501);
    res.res.statusMessage.should.be.equal('Not Implemented');
    res.body.should.deepEqual({
      error: {
        code: "501",
        message: "Not Implemented"    
      }
    
    });
  });

  it('should not return custom message if status is letter or equal 500', async function () {
    server.action('server-error', (req, res, next) => {
        const error = new Error("I can only brew tea");

        error.status = 418;
        throw error;
      });
    httpServer = server.listen(port);

    const res = await request(host).post(`/node.odata.server-error`)

    res.status.should.be.equal(418);
    res.res.statusMessage.should.be.equal('I\'m a Teapot');
    res.body.should.deepEqual({
      error: {
        code: "418",
        message: "I can only brew tea"    
      }
    
    });
  });
});
