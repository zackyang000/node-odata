import 'should';
import request from 'supertest';
import sinon from 'sinon';
import { odata, host, port, assertSuccess } from '../../../support/setup';
import mongoose from 'mongoose';
import { init } from '../../../support/db';

describe('mongo.mocked.client.count', () => {
  let httpServer, server, modelMock, instanceMock, queryMock, query, Model;

  before(() => {
    const Schema = mongoose.Schema;
    const ModelSchema = new Schema({
      client: Number
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

  it('should apply client to the count', async function () {
    const entity = server.mongoEntity('client', Model);

    entity.clientField = 'client';

    modelMock = sinon.mock(Model);
    modelMock.expects('find').once()
      .withArgs({
        client: 99
      }).returns(query);
    httpServer = server.listen(port);

    const res = await request(host).get(`/client/$count?sap-client=099`);

    modelMock.verify();
    assertSuccess(res);

  });

});
