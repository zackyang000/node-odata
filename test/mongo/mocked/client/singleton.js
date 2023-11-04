import 'should';
import request from 'supertest';
import sinon from 'sinon';
import { odata, host, port, assertSuccess } from '../../../support/setup';
import mongoose from 'mongoose';
import { init } from '../../../support/db';

const Schema = mongoose.Schema;
const ModelSchema = new Schema({
  client: Number
});

const Model = mongoose.model('client', ModelSchema);

describe('mongo.mocked.odata.client', () => {
  const query = {
    $where: () => { },
    where: () => { },
    equals: () => { },
    gte: () => { },
    lt: () => { },
    exec: () => { },
    count: () => new Promise((resolve) => resolve(1)),
    model: Model
  };
  let httpServer, server, modelMock, instanceMock, queryMock;

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

  it('should returns a transient singleton with wrong client', async function () {
    const entity = server.mongoSingleton('client', Model);

    entity.clientField = 'client';

    modelMock = sinon.mock(Model);
    modelMock.expects('findOne').once()
      .withArgs({
        client: 99
      })
      .returns(query);
    queryMock = sinon.mock(query);
    queryMock.expects('exec').once()
      .returns(new Promise(resolve => resolve()));
    instanceMock = sinon.mock(Model.prototype);
    instanceMock.expects('toObject').once()
      .returns({});
    httpServer = server.listen(port);

    const res = await request(host).get(`/client?sap-client=099`);

    res.body.should.deepEqual({
      id: null,
      client: 99
    });

    modelMock.verify();
    queryMock.verify();
    instanceMock.verify();
  });

  it('should returns a singleton with client', async function () {
    const entity = server.mongoSingleton('client', Model);

    entity.clientField = 'client';

    modelMock = sinon.mock(Model);
    modelMock.expects('findOne').once()
      .withArgs({
        client: 99
      })
      .returns(query);
    queryMock = sinon.mock(query);
    queryMock.expects('exec').once()
      .returns(new Promise(resolve => resolve({
        toObject: () => ({
          id: '1',
          client: 99
        })
      })));
    httpServer = server.listen(port);

    const res = await request(host).get(`/client?sap-client=099`);

    res.body.should.deepEqual({
      id: '1',
      client: 99
    });

    modelMock.verify();
    queryMock.verify();
    instanceMock.verify();
  });
});
