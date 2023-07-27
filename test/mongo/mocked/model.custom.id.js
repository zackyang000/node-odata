import 'should';
import request from 'supertest';
import { odata, host, port, assertSuccess } from '../../support/setup';
import sinon from 'sinon';
import mongoose from 'mongoose';
import { init } from '../../support/db';

const Schema = mongoose.Schema;

describe('model.custom.id', () => {
  let httpServer, modelMock, queryMock, Model;

  before(async function () {
    const server = odata();

    const ModelSchema = new Schema({
      id: {
        type: Number,
        unique: true
      }
    });

    Model = mongoose.model('custom-id', ModelSchema);

    server.mongoEntity('custom-id', Model, undefined, {
      id: {
        $Type: 'Edm.Int16'
      }
    }, undefined, {
      id: {
        target: 'id',
        attributes: {
          $Type: 'Edm.Int16'
        }
      }
    });
    init(server);

    httpServer = server.listen(port);
  });

  after(() => {
    httpServer.close();
  });

  afterEach(() => {
    modelMock.restore();
    queryMock?.restore();
  })

  it('should work when use a custom id to query specific entity', async function () {
    modelMock = sinon.mock(Model);
    modelMock.expects('findById').once().callsArgWith(1, null, {
      toObject: () => ({
        id: 100
      })
    });

    const res = await request(host).get('/custom-id(100)');
    assertSuccess(res);
    res.body.id.should.be.equal(100);
    modelMock.verify();
  });

  it('should work when use a custom id to query a list', async function () {
    const query = {
      where: () => { },
      equals: () => { },
      exec: () => { },
      model: Model
    };
    modelMock = sinon.mock(Model);
    queryMock = sinon.mock(query);
    modelMock.expects('find').once().returns(query);

    queryMock.expects('where').once().withArgs('id').returns(query);
    queryMock.expects('equals').once().withArgs(100);
    queryMock.expects('exec').once().callsArgWith(0, null, [{
      toObject: () => ({
        id: 100
      })
    }]);
    const res = await request(host).get('/custom-id?$filter=id eq 100');
    assertSuccess(res);
    res.body.value.length.should.be.greaterThan(0);
    queryMock.verify();
    modelMock.verify();
  });
});