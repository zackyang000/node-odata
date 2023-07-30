// For issue: https://github.com/TossShinHwa/node-odata/issues/69

import 'should';
import 'should-sinon';
import request from 'supertest';
import { odata, assertSuccess, host, port } from '../../support/setup';
import sinon from 'sinon';
import mongoose from 'mongoose';
import { init } from '../../support/db';

const Schema = mongoose.Schema;

describe('model.complex.filter', () => {
  let httpServer, modelMock, queryMock;

  before(() => {
    const server = odata();
    const ComplexModelSchema = new Schema({
      product: { price: Number }
    });

    mongoose.set('overwriteModels', true);
    const ComplexModel = mongoose.model('complex-model-filter', ComplexModelSchema);

    server.mongoEntity('complex-model-filter', ComplexModel);
    init(server);

    const query = {
      where: () => { },
      gt: () => { },
      select: () => { },
      exec: () => { },
      model: ComplexModel
    };
    modelMock = sinon.mock(ComplexModel);
    queryMock = sinon.mock(query);
    modelMock.expects('find').once().withArgs({"product.price": {$gt: 30}}).returns(query);

    queryMock.expects('select').once().withArgs({ _id: 0, product: 1});
    queryMock.expects('exec').once().callsArgWith(0, null, [{
      toObject: () => ({
        product: {
          price: 50
        }
      })
    }]);
    httpServer = server.listen(port);
  });

  after(() => {
    httpServer.close();
  });

  afterEach(() => {
    modelMock.restore();
    queryMock?.restore();
  })
  
  it('should work when filter a complex entity', async function () {
    let res = await request(host).get(`/complex-model-filter?$select=product&$filter=product.price gt 30`);
    assertSuccess(res);
    res.body.should.deepEqual({
      value: [{
        product: {
          price: 50
        }
      }]
    });
    modelMock.verify();
    queryMock.verify();
  });
});
