import 'should';
import sinon from 'sinon';
import request from 'supertest';
import FakeDb from './support/fake-db';
import { odata, host, port } from './support/setup';

describe('model.hidden.field', function () {
  let httpServer, id, resource, mock;

  before(async function () {
    const db = new FakeDb();
    const server = odata(db);
    resource = server.resource('hidden-field', {
      name: String,
      password: {
        type: String,
        select: false
      }
    });
    httpServer = server.listen(port);
    const data = db.addData('hidden-field', [{
      name: 'zack',
      password: '123'
    }]);
    id = data[0].id;
  });

  after(() => {
    httpServer.close();
  });

  afterEach(() => {
    mock.restore();
  });

  it('should work when get entities list even it is selected', async function () {
    mock = sinon.mock(resource.model);
    mock.expects('select').once().withArgs({
      _id: 0,
      name: 1
    }).returns(resource.model);
    await request(host).get('/hidden-field?$select=name, password');
    mock.verify();
  });

  it('should work when get entities list even only it is selected', async function () {
    mock = sinon.mock(resource.model);
    mock.expects('select').never().returns(resource.model);
    await request(host).get('/hidden-field?$select=password');
    mock.verify();
  });
});
