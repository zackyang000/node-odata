// For issue: https://github.com/TossShinHwa/node-odata/issues/69

import 'should';
import 'should-sinon';
import request from 'supertest';
import { odata, assertSuccess, host, port } from './support/setup';
import Db from './support/fake-db';
import sinon from 'sinon';

describe('model.complex.filter', () => {
  let httpServer, db, mock;

  before(() => {
    db = new Db();
    const server = odata(db);
    const resource = server.resource('complex-model-filter', { product: { price: Number } });

    mock = sinon.mock(resource.model);
    mock.expects('where').once().withArgs('product.price').returns(resource.model);
    mock.expects('gt').once().withArgs(30).returns(resource.model);
    httpServer = server.listen(port);
  });

  after(() => {
    httpServer.close();
  });

  it('should work when PUT a complex entity', async function() {
    const res = await request(host).get(`/complex-model-filter?$filter=product-price gt 30`);

    assertSuccess(res);
    mock.verify();
  });
});
