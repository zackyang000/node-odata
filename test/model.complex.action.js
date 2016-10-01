// For issue: https://github.com/TossShinHwa/node-odata/issues/69

import 'should';
import request from 'supertest';
import { odata, conn, host, port } from './support/setup';

function makeFakePrice() {
  return Math.floor(Math.random() * 100);
}

describe('model.complex.action', () => {
  let httpServer;

  before(() => {
    const server = odata(conn);
    server.resource('order', { product: [{ price: Number }] })
    .action('/all-item-greater', (req, res, next) => {
      const { price } = req.query;
      const $elemMatch = { price: { $gt: price } };
      server.resources.order.find()
      .select({ product: { $elemMatch } })
      .exec((err, data) => res.jsonp(data));
    });
    httpServer = server.listen(port);
  });

  after(() => {
    httpServer.close();
  });

  it('should work when PUT a complex entity', async function() {
    for (let i = 0; i < 100; i++) {
      const entity = {
        product: [
          { price: makeFakePrice() },
          { price: makeFakePrice() },
          { price: makeFakePrice() },
        ],
      };
      await request(host).post('/order').send(entity);
    }
    const res = await request(host).get(`/complex-model-filter/all-item-price-great?price=30`);
    res.body.should.matchEach((item) => {
      return item.product[0].price > 30
      && item.product[1].price > 30
      && item.product[2].price > 30;
    });
  });
});
