import 'should';
import sinon from 'sinon';
import request from 'supertest';
import { odata, host, port, bookSchema } from './support/setup';
import data from './support/books.json';
import FakeDb from './support/fake-db';

describe('odata.query.orderby', () => {
  let httpServer, mock, resource;

  before(async function() {
    const db = new FakeDb();
    const server = odata(db);
    resource = server.resource('book', bookSchema)
    httpServer = server.listen(port);
    db.addData('book', data);
  });

  after(() => {
    httpServer.close();
  });

  afterEach(() => {
    mock.restore();
  });

  it('should default let items order with asc', async function() {
    mock = sinon.mock(resource.model);
    mock.expects('sort').once().withArgs({
      price: 'asc'
    }).returns(resource.model);
    await request(host).get('/book?$orderby=price');
    mock.verify();
  });

  it('should let items order asc', async function() {
    mock = sinon.mock(resource.model);
    mock.expects('sort').once().withArgs({
      price: 'asc'
    }).returns(resource.model);
    await request(host).get('/book?$orderby=price asc');
    mock.verify();
  });

  it('should let items order desc', async function() {
    mock = sinon.mock(resource.model);
    mock.expects('sort').once().withArgs({
      price: 'desc'
    }).returns(resource.model);
    await request(host).get('/book?$orderby=price desc');
    mock.verify();
  });

  it('should let items order when use multiple fields', async function() {
    mock = sinon.mock(resource.model);
    mock.expects('sort').once().withArgs({
      price: 'asc',
      title: 'asc'
    }).returns(resource.model);
    await request(host).get('/book?$orderby=price,title');
    mock.verify();
  });

  it("should be ignore when order by not exist field", async function() {
    mock = sinon.mock(resource.model);
    mock.expects('sort').once().withArgs({
      'not-exist-field': 'asc'
    }).returns(resource.model);
    await request(host).get('/book?$orderby=not-exist-field');
    mock.verify();
  });
});
