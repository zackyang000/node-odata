import 'should';
import request from 'supertest';
import sinon from 'sinon';
import { odata, host, port, assertSuccess } from '../../../support/setup';
import mongoose from 'mongoose';
import { init } from '../../../support/db';

describe('mongo.mocked.client.post', () => {
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

  it('should fail with wrong client in body', async function () {
    const entity = server.mongoEntity('client', Model);

    entity.clientField = 'client';

    instanceMock = sinon.mock(Model.prototype);
    instanceMock.expects('save').never();
    httpServer = server.listen(port);

    const res = (await request(host).post(`/client?sap-client=099`)
      .send({
        client: 98,
        text: 'patched'
      }));

    instanceMock.verify();
    res.body.should.deepEqual({
      error: {
        message: 'Client value in custom parameter differs from client value in body',
        code: '400'
      }
    });

  });

  it('should work if client is in body too', async function () {
    const entity = server.mongoEntity('client', Model);

    entity.clientField = 'client';

    instanceMock = sinon.mock(Model.prototype);
    instanceMock.expects('save').once()
      .withArgs({
        validateBeforeSave: true,
        validateModifiedOnly: true
      });
    instanceMock.expects('toObject').once()
      .returns({
        _id: '1',
        client: 99,
        text: 'original'
      })
    httpServer = server.listen(port);

    const res = (await request(host).post(`/client?sap-client=099`)
      .send({
        client: 99,
        text: 'original'
      }));

    instanceMock.verify();
    assertSuccess(res);

    res.body.should.deepEqual({
      id: '1',
      client: 99,
      text: 'original'
    });

  });

});
