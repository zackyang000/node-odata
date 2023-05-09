import 'should';
import 'should-sinon';
import request from 'supertest';
import { odata, host, port } from '../support/setup';
import FakeDb from '../support/fake-db';
import sinon from 'sinon';

function requestToHalfPrice(id) {
  return request(host).post(`/book(${id})/50off`);
}

function halfPrice(price) {
  return +(price / 2).toFixed(2);
}

describe('hook.action', () => {
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


  it('should call fn and before hook', async function () {
    const callbackFn = sinon.spy();
    const action = server.action('salam-aleikum', async (req, res) => {
      callbackFn();
      res.$odata.result = { result: req.hook };
    });

    const callbackHook = sinon.spy();
    action.addBefore(async (req, res) => {
      req.hook = 'data drives';
      callbackHook();
    });
    httpServer = server.listen(port);

    const res = await request(host).post(`/node.odata.salam-aleikum`);

    res.body.should.deepEqual({result: 'data drives'});

    callbackFn.should.be.callCount(1);
    callbackHook.should.be.callCount(1);
  });

  it('should return error from before hook and not execute fn', async function () {
    const callback = sinon.spy();
    const action = server.action('salam-aleikum', async (req, res) => {
      callback();
      res.$odata.result = {result: 'authority check don`t works'};
    });

    action.addBefore(async (req, res) => {
      const error = new Error();

      error.status = 401;
      
      throw error;
    });
    httpServer = server.listen(port);

    const res = await request(host).post(`/node.odata.salam-aleikum`);

    res.res.statusMessage.should.be.equal('Unauthorized');
    callback.should.be.callCount(0);
  });

  it('should call fn and after hook', async function () {
    const callbackFn = sinon.spy();
    const action = server.action('salam-aleikum', (req, res) => {
      callbackFn();
      res.$odata.result = {result: 'data drives'};
    });

    const callbackHook = sinon.spy();
    action.addAfter(async (req, res) => {
      callbackHook();
    });
    httpServer = server.listen(port);

    const res = await request(host).post(`/node.odata.salam-aleikum`);

    res.body.should.deepEqual({result: 'data drives'});

    callbackFn.should.be.callCount(1);
    callbackHook.should.be.callCount(1);
  });

});
