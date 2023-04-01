import 'should';
import sinon from 'sinon';
import request from 'supertest';
import { odata, host, port, bookSchema } from '../support/setup';
import data from '../support/books.json';
import FakeDb from '../support/fake-db';

describe('odata.query.select', () => {
  let httpServer, mock, resource;

  before(async function() {
    const db = new FakeDb();
    const server = odata(db);
    resource = server.resource('book', bookSchema);
    resource.model.model.schema.tree = {
      id: {
        select: true
      },
      price: {
        select: true
      },
      title: {
        select: true
      }
    }
    httpServer = server.listen(port);
    db.addData('book', data);
  });

  after(() => {
    httpServer.close();
  });

  afterEach(() => {
    mock.restore();
  });

  it('should select anyone field', async function() {
    mock = sinon.mock(resource.model);
    mock.expects('select').once().withArgs({
      _id: 0,
      price: 1
    }).returns(resource.model);
    await request(host).get('/book?$select=price');
    mock.verify();
  });
  it('should select multiple field', async function() {
    mock = sinon.mock(resource.model);
    mock.expects('select').once().withArgs({
      _id: 0,
      price: 1,
      title: 1
    }).returns(resource.model);
    await request(host).get('/book?$select=price,title');
    mock.verify();
  });
  it('should select multiple field with blank space', async function() {
    mock = sinon.mock(resource.model);
    mock.expects('select').once().withArgs({
      _id: 0,
      price: 1,
      title: 1
    }).returns(resource.model);
    await request(host).get('/book?$select=price,   title');
    mock.verify();
  });
  it('should select id field', async function() {
    mock = sinon.mock(resource.model);
    mock.expects('select').once().withArgs({
      _id: 1,
      price: 1,
      title: 1
    }).returns(resource.model);
    await request(host).get('/book?$select=price,title,id');
    mock.verify();
  });
  it('should ignore when select not exist field', async function() {
    mock = sinon.mock(resource.model);
    mock.expects('select').never();
    await request(host).get('/book?$select=not-exist-field');
    mock.verify();
  });
});
