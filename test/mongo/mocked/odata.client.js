import 'should';
import request from 'supertest';
import sinon from 'sinon';
import { odata, host, port, assertSuccess } from '../../support/setup';
import mongoose from 'mongoose';
import { init } from '../../support/db';

const Schema = mongoose.Schema;
const ModelSchema = new Schema({
  client: Number
});

const Model = mongoose.model('client', ModelSchema);

describe('mongo.mocked.odata.entity', () => {
  let httpServer, server, modelMock;

  beforeEach(async function () {
    server = odata();
    init(server);

    const entity = server.mongoEntity('client', Model);

    entity.clientField = 'client';

  });

  afterEach(() => {
    if (httpServer) {
      httpServer.close();
    }
    modelMock?.restore();
  });


  it('should apply client to the key', async function () {
    modelMock = sinon.mock(Model);
    modelMock.expects('findById').once()
      .withArgs('1')
      .returns(new Promise(resolve => resolve({
        toObject: () => ({
          _id: 1,
          client: 99
        })
      })));
    httpServer = server.listen(port);

    const res = await request(host).get(`/client('1')?sap-client=099`);

    assertSuccess(res);

    modelMock.verify();
  });

});
