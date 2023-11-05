import 'should';
import request from 'supertest';
import sinon from 'sinon';
import { odata, host, port, assertSuccess } from '../../../support/setup';
import mongoose from 'mongoose';
import { init } from '../../../support/db';

describe('mongo.mocked.client.delete', () => {
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

  it('should fail on delete with wrong client', async function () {
    const entity = server.mongoEntity('client', Model);

    entity.clientField = 'client';

    modelMock = sinon.mock(Model);
    modelMock.expects('findById').once()
      .withArgs('1')
      .returns(new Promise(resolve => resolve({
        toObject: () => ({
          _id: 1,
          client: 98
        })
      })));
    httpServer = server.listen(port);

    const res = await request(host).delete(`/client('1')?sap-client=099`);

    modelMock.verify();
    res.status.should.be.equal(404);

  });

  it('should work on delete with client', async function () {
    const entity = server.mongoEntity('client', Model);

    entity.clientField = 'client';

    const instance = {
      client: 99,
      deleteOne: async () => {}
    };
    modelMock = sinon.mock(Model);
    modelMock.expects('findById').once()
      .withArgs('1')
      .returns(new Promise(resolve => resolve(instance)));

    instanceMock = sinon.mock(instance);
    instanceMock.expects('deleteOne').once();
    httpServer = server.listen(port);

    const res = await request(host).delete(`/client('1')?sap-client=099`);

    modelMock.verify();
    instanceMock.verify();
    res.status.should.be.equal(204);

  });

});
