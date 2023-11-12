import 'should';
import 'should-sinon';
import request from 'supertest';
import sinon from 'sinon';
import { odata, host, port, assertSuccess } from './support/setup';
import { BookMetadata } from './support/books.model';
import mongoose from 'mongoose';

describe('hook.entity.before', function() {
  let httpServer, server;

  beforeEach(async function() {
    server = odata();
    server.entity('book', {
      get: (req, res, next) => {
        res.$odata.result = {
          title: "Test hook"
        };
        res.$odata.status = 200;
        next();
      }
    }, BookMetadata);
  });

  afterEach(() => {
    httpServer.close();
    mongoose.default.connection.close();
  });

  it('should work', async function() {
    const callback = sinon.spy();
    server.resources.book.addBefore((req, res, next) => {
      callback();
      req.$odata.$Key.should.be.have.property('id');
      req.$odata.$Key.id.should.be.equal('AFFE');
      next();
    });
    httpServer = server.listen(port);
    const res = await request(host).get(`/book('AFFE')`);
    assertSuccess(res);
    callback.should.be.called();
  });
  it('should work with multiple hooks', async function() {
    const callback = sinon.spy();
    const hook = (req, res, next) => {
      callback();
      next();
    };
    server.resources.book.addBefore(hook);
    server.resources.book.addBefore(hook);
    httpServer = server.listen(port);
    await request(host).get(`/book('AFFE')`);
    callback.should.be.calledTwice();
  });
});

