import 'should';
import request from 'supertest';
import sinon from 'sinon';
import { odata, host, port, assertSuccess } from '../../../support/setup';
import mongoose from 'mongoose';
import { init } from '../../../support/db';

describe('mongo.mocked.client.patchSingleton', () => {
  let httpServer, server, modelMock, instanceMock, queryMock, query, Model;

  before(() => {
    const Schema = mongoose.Schema;
    const ModelSchema = new Schema({
      client: Number,
      text: String
    });
    
    mongoose.set('overwriteModels', true);


    Model = mongoose.model('client', ModelSchema);

    query = {
      $where: () => { },
      where: () => { },
      equals: () => { },
      gte: () => { },
      lt: () => { },
      exec: () => { },
      count: () => new Promise((resolve) => resolve(1)),
      model: Model
    };
  });

  beforeEach(async function () {
    server = odata();
    init(server);

  });

  afterEach(() => {
    if (httpServer) {
      httpServer.close();
    }
    modelMock?.restore();
    instanceMock?.restore();
    queryMock?.restore();
  });

  it('should work for upsert', async function () {
    const entity = server.mongoSingleton('client', Model);

    entity.clientField = 'client';

    modelMock = sinon.mock(Model);
    modelMock.expects('findOne').once()
      .withArgs({
        client: 99
      })
      .returns(new Promise(resolve => resolve()));
    instanceMock = sinon.mock(Model.prototype);
    instanceMock.expects('save').once()
      .withArgs({
        validateBeforeSave: true,
        validateModifiedOnly: true
      }).returns(new Promise(resolve => resolve()));
    instanceMock.expects('toObject').once()
      .returns({
        _id: '1',
        client: 99,
        text: 'patched'
      });
    httpServer = server.listen(port);

    const res = (await request(host).patch(`/client?sap-client=099`)
      .send({
        text: 'patched'
      }));

    modelMock.verify();
    instanceMock.verify();
    assertSuccess(res);

    res.body.should.deepEqual({
      id: '1',
      client: 99,
      text: 'patched'
    });

  });

  it('should fail with wrong client in body', async function () {
    const entity = server.mongoSingleton('client', Model);

    entity.clientField = 'client';

    modelMock = sinon.mock(Model);
    modelMock.expects('findOne').once()
      .withArgs({
        client: 99
      })
      .returns(new Promise(resolve => resolve({
        _id: '1',
        toObject: () => ({
          _id: '1',
          client: 99,
          text: 'original'
        })
      })));
    modelMock.expects('updateOne').never();
    httpServer = server.listen(port);

    const res = (await request(host).patch(`/client?sap-client=099`)
      .send({
        client: 98,
        text: 'patched'
      }));

    modelMock.verify();
    res.body.should.deepEqual({
      error: {
        message: 'Client value in custom parameter differs from client value in body',
        code: '400'
      }
    });

  });

  it('should work if client is in body too', async function () {
    const entity = server.mongoSingleton('client', Model);

    entity.clientField = 'client';

    modelMock = sinon.mock(Model);
    modelMock.expects('findOne').once()
      .withArgs({
        client: 99
      }).returns(new Promise(resolve => resolve({
        _id: '1',
        toObject: () => ({
          _id: '1',
          client: 99,
          text: 'original'
        })
      })));
    modelMock.expects('updateOne').once()
    .withArgs({
      _id: '1'
    }, {
      _id: '1',
      client: 99,
      text: 'patched'
    }).returns(new Promise(resolve => resolve()));
    httpServer = server.listen(port);

    const res = (await request(host).patch(`/client?sap-client=099`)
      .send({
        client: 99,
        text: 'patched'
      }));

    modelMock.verify();
    assertSuccess(res);

    res.body.should.deepEqual({
      id: '1',
      client: 99,
      text: 'patched'
    });

  });
  
});
