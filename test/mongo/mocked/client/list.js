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

  it('should creates filter with client', async function () {
    const entity = server.mongoEntity('client', Model);

    entity.clientField = 'client';

    modelMock = sinon.mock(Model);
    modelMock.expects('find').once()
      .withArgs({
        client: {
          eq: 99
        }
      }).returns(query);
    httpServer = server.listen(port);

    const res = await request(host).get(`/client?sap-client=099`);

    assertSuccess(res);

    modelMock.verify();
  });

});
