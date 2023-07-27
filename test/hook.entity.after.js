import 'should';
import 'should-sinon';
import request from 'supertest';
import sinon from 'sinon';
import { odata, host, port, assertSuccess } from './support/setup';
import { BookMetadata } from './support/books.model';
import mongoose from 'mongoose';

describe('hook.entity.after', function() {
  let data, httpServer, server, db;

  beforeEach(async function() {
    server = odata();
    server.entity('book', {
      get: (req, res, next) => {
        res.$odata.result = {
          title: "Test hook"
        };
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
    server.resources.book.addAfter((req, res, next) => {
      res.$odata.result.should.be.have.property('title');
      res.$odata.result.title.should.be.equal("Test hook");
      callback();
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
    
    server.resources.book.addAfter(hook);
    server.resources.book.addAfter(hook);
    httpServer = server.listen(port);
    const res = await request(host).get(`/book('AFFE')`);
    assertSuccess(res);
    callback.should.be.calledTwice();
  });
});

