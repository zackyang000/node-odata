// For issue: https://github.com/TossShinHwa/node-odata/issues/69

import 'should';
import request from 'supertest';
import { odata, host, port, assertSuccess } from './support/setup';
import FakeDb from './support/fake-db';

describe('model.complex.action', () => {
  let httpServer;

  before(() => {
    const db = new FakeDb();
    const server = odata(db);
    const resource = server.resource('order', { product: [{ price: Number }] });

    resource.action('/all-item-greater', (req, res, next) => {
        const { price } = req.query;
        const $elemMatch = { price: { $gt: price } };
        server.resources.order.model.exec((err, data) => res.jsonp(data.slice(1)));
      }, { binding : 'collection' });
    httpServer = server.listen(port);
  });

  after(() => {
    httpServer.close();
  });

  it('should work when PUT a complex entity', async function () {
    const entities = [{
      product: [
        { price: 1 },
        { price: 2 },
        { price: 4 },
      ],
    }, {
      product: [
        { price: 32 },
        { price: 64 },
        { price: 99 },
      ],
    }];
    entities.forEach(async entity => await request(host).post('/order').send(entity));

    const res = await request(host).post(`/order/all-item-greater`);
    assertSuccess(res);
    res.body.should.matchEach((item) => {
      return item.product[0].price > 30
        && item.product[1].price > 30
        && item.product[2].price > 30;
    });
  });
});
