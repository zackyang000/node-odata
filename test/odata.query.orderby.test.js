import 'should';
import request from 'supertest';
import { odata, conn, host, port, bookSchema, initData } from './support/setup';

describe('odata.query.orderby', () => {
  let data, httpServer;

  before(async function() {
    data = await initData();
    const server = odata(conn);
    server.resource('book', bookSchema)
    httpServer = server.listen(port);
  });

  after(() => {
    httpServer.close();
  });

  it('should default let items order with asc', async function() {
    const res = await request(host).get('/book?$orderby=price');
    const entities = res.body.value;
    entities.map((item, i) => {
      if (i > 0) {
        const prevItem = entities[i -1];
        item.price.should.be.aboveOrEqual(prevItem.price);
      }
    });
  });

  it('should let items order asc', async function() {
    const res = await request(host).get('/book?$orderby=price asc');
    const entities = res.body.value;
    entities.map((item, i) => {
      if (i > 0) {
        const prevItem = entities[i -1];
        item.price.should.be.aboveOrEqual(prevItem.price);
      }
    });
  });

  it('should let items order desc', async function() {
    const res = await request(host).get('/book?$orderby=price desc');
    const entities = res.body.value;
    entities.map((item, i) => {
      if (i > 0) {
        const prevItem = entities[i -1];
        item.price.should.be.belowOrEqual(prevItem.price);
      }
    });
  });

  it('should let items order when use multiple fields', async function() {
    const res = await request(host).get('/book?$orderby=price,title');
    const entities = res.body.value;
    entities.map((item, i) => {
      if (i > 0) {
        const prevItem = entities[i -1];
        item.price.should.be.aboveOrEqual(prevItem.price);
        if (item.price === prevItem.price) {
          item.title.should.be.aboveOrEqual(prevItem.title);
        }
      }
    });
  });

  it("should be ignore when order by not exist field", async function() {
    const res = await request(host).get('/book?$orderby=not-exist-field');
    res.body.should.be.have.property('value');
    res.body.value.length.should.greaterThan(0);
  });
});
