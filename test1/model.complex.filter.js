// For issue: https://github.com/TossShinHwa/node-odata/issues/69

import 'should';
import request from 'supertest';
import { odata, conn, host, port } from './support/setup';

describe('model.complex.filter', () => {
  let httpServer;

  before(() => {
    const server = odata(conn);
    server.resource('complex-model-filter', { product: [{ price: Number }] });
    httpServer = server.listen(port);
  });

  after(() => {
    httpServer.close();
  });

  it('should work when PUT a complex entity', async function() {
    for (let i = 0; i < 100; i++) {
      const price = Math.floor(Math.random() * 100);
      await request(host).post('/complex-model-filter').send({ product: [{ price }] });
    }
    const res = await request(host).get(`/complex-model-filter?$filter=product.price gt 30`);
    res.body.value.should.matchEach((item) => item.product[0].price > 30);
  });
});
