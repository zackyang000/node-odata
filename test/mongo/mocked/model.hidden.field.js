import 'should';
import sinon from 'sinon';
import request from 'supertest';
import { odata, host, port, assertSuccess } from '../../support/setup';
import mongoose from 'mongoose';
import { init } from '../../support/db';

const Schema = mongoose.Schema;

describe('mongo.mocked.model.hidden.field', function () {
  let httpServer, modelMock, queryMock, Model;

  before(async function () {
    const server = odata();

    const ModelSchema = new Schema({
      name: String,
      password: {
        type: String,
        select: false
      }
    });

    Model = mongoose.model('hidden-field', ModelSchema);

    server.mongoEntity('hidden-field', Model);
    init(server);

    httpServer = server.listen(port);

  });

  after(() => {
    httpServer.close();
  });

  afterEach(() => {
    modelMock.restore();
    queryMock?.restore();
  });

  it('should work when get entities list even it is selected', async function () {
    const query = {
      where: () => { },
      select: () => { },
      exec: () => { },
      model: Model
    };
    modelMock = sinon.mock(Model);
    queryMock = sinon.mock(query);
    modelMock.expects('find').once().returns(query);

    queryMock.expects('select').once().withArgs({
      _id: 0,
      name: 1
    });
    queryMock.expects('exec').once()
      .returns(new Promise(resolve => resolve([{
        toObject: () => ({
          name: 'zack'
        })
      }])));

    const res = await request(host).get('/hidden-field?$select=name, password');

    assertSuccess(res);
    res.body.should.deepEqual({
      value: [{
        name: 'zack'
      }]
    });
    modelMock.verify();
    queryMock.verify();
  });

  it('should work when get entities list even only it is selected', async function () {
    const query = {
      where: () => { },
      select: () => { },
      exec: () => { },
      model: Model
    };
    modelMock = sinon.mock(Model);
    queryMock = sinon.mock(query);
    modelMock.expects('find').once().returns(query);

    queryMock.expects('select').never();
    queryMock.expects('exec').once()
      .returns(new Promise(resolve => resolve([{
        toObject: () => ({
          _id: 'AFFE',
          name: 'zack'
        })
      }])));

    const res = await request(host).get('/hidden-field?$select=password');

    assertSuccess(res);
    res.body.should.deepEqual({
      value: [{
        id: 'AFFE',
        name: 'zack'
      }]
    });
    modelMock.verify();
    queryMock.verify();
  });
});
