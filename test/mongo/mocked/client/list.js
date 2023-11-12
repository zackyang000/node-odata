import 'should';
import request from 'supertest';
import sinon from 'sinon';
import { odata, host, port, assertSuccess } from '../../../support/setup';
import mongoose from 'mongoose';
import { init } from '../../../support/db';

describe('mongo.mocked.client.list', () => {
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

  it('should extend filter with client', async function () {
    const entity = server.mongoEntity('client', Model);

    entity.clientField = 'client';

    modelMock = sinon.mock(Model);
    modelMock.expects('find').once()
      .withArgs({
        $and: [{
          client: {
            $eq: 99
          }
        }, {
          client: {
            $eq: 88
          }
        }]
      }).returns(query);
    queryMock = sinon.mock(query);
    queryMock.expects('exec').once()
      .returns(new Promise(resolve => resolve([])));
    httpServer = server.listen(port);

    const res = await request(host).get(`/client?$filter=client eq 88&sap-client=099`);

    modelMock.verify();

    assertSuccess(res);

  });

  it('should creates filter with client', async function () {
    const entity = server.mongoEntity('client', Model);

    entity.clientField = 'client';

    modelMock = sinon.mock(Model);
    modelMock.expects('find').once()
      .withArgs({
        client: {
          $eq: 99
        }
      }).returns(query);
    queryMock = sinon.mock(query);
    queryMock.expects('exec').once()
      .returns(new Promise(resolve => resolve([])));
    httpServer = server.listen(port);

    const res = await request(host).get(`/client?sap-client=099`);

    modelMock.verify();

    assertSuccess(res);

  });

});
