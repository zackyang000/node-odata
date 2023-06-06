import 'should';
import request from 'supertest';
import { odata, host, port, bookSchema, assertSuccess } from '../support/setup';
import data from '../support/books.json';
import FakeDb from '../support/fake-db';
import sinon from 'sinon';

describe('odata.batch', () => {
  let httpServer, books, resource, sandbox;

  beforeEach(async function () {
    const db = new FakeDb();
    const server = odata(db);
    resource = server.resource('book', bookSchema);
    resource.action('entity-action', async (req, res) => {
        res.$odata.result = {result: 'Hello! I am an action, that bound to entity.'};
      }, { binding: 'entity'});
    server.action('unbound-action', async (req, res) => {
      res.$odata.result = { result: 'Hello! I am an unbound action.'};
    })
    books = JSON.parse(JSON.stringify(db.addData('book', data)));
    httpServer = server.listen(port);
    sandbox = sinon.createSandbox();
  });

  afterEach(() => {
    httpServer.close();
    sandbox.restore();
  });

  
  it('should work with get lists', async function () {
    const result = [
      {
        "title": "XML Developer's Guide"
      }, {
        "title": "MSXML3: A Comprehensive Guide"
      }, {
        "title": "Visual Studio 7: A Comprehensive Guide"
      }
    ];

    const mock = sandbox.mock(resource.model);
    mock.expects('select').once().withArgs({
      _id: 0,
      title: 1
    }).returns(resource.model);
    mock.expects('$where').once().withArgs('this.title.indexOf(\'Guide\') != -1').returns(resource.model);
    const stub = sandbox.stub(resource.model, "exec");
    stub.callsArgWith(0, undefined, result);
    const res = await request(host).post(`/$batch`).send({
      requests: [{
        id: "1",
        method: "get",
        url: `/book?$filter=contains(title, 'Guide')&$select=title`
      }]
    });
    assertSuccess(res);
    mock.verify();
    res.body.should.deepEqual({
      responses: [{
        id: "1",
        status: 200,
        statusText: 'OK',
        headers: {
          'OData-Version': '4.0',
          'content-type': 'application/json'
        },
        body: {
          value: result
        }
      }]
    });
  });

  it('should work with get entity', async function () {
    const res = await request(host).post(`/$batch`).send({
      requests: [{
        id: "1",
        method: "get",
        url: `/book('${books[0].id}')`
      }]
    });
    assertSuccess(res);
    res.body.should.deepEqual({
      responses: [{
        id: "1",
        status: 200,
        statusText: 'OK',
        headers: {
          'OData-Version': '4.0',
          'content-type': 'application/json'
        },
        body: books[0]
      }]
    });
  });

  it('should work with post entity', async function () {
    const result = {
      title: "War and peace"
    };
    const res = await request(host).post(`/$batch`).send({
      requests: [{
        id: "1",
        method: "post",
        url: `/book`,
        body: result
      }]
    });
    assertSuccess(res);
    result.id = (+books[books.length - 1].id + 1).toString();
    res.body.should.deepEqual({
      responses: [{
        id: "1",
        status: 201,
        statusText: 'Created',
        headers: {
          'OData-Version': '4.0',
          'content-type': 'application/json'
        },
        body: result
      }]
    });
  });

  it('should work with put entity', async function () {
    const result = {
      id: "1",
      title: "War and peace"
    };
    const res = await request(host).post(`/$batch`).send({
      requests: [{
        id: "1",
        method: "put",
        url: `/book('1')`,
        body: result
      }]
    });
    assertSuccess(res);
    res.body.should.deepEqual({
      responses: [{
        id: "1",
        status: 200,
        statusText: "OK",
        headers: {
          'OData-Version': '4.0',
          'content-type': 'application/json'
        },
        body: result
      }]
    });
  });


  it('should work with patch entity', async function () {
    const result = {
      id: "1",
      title: "War and peace"
    };
    const res = await request(host).post(`/$batch`).send({
      requests: [{
        id: "1",
        method: "patch",
        url: `/book('1')`,
        body: result
      }]
    });
    assertSuccess(res);
    res.body.should.deepEqual({
      responses: [{
        id: "1",
        status: 200,
        statusText: "OK",
        headers: {
          "OData-Version": "4.0",
          "content-type": "application/json"
        },
        body: result
      }]
    });
  });


  it('should work with delete entity', async function () {
    const res = await request(host).post(`/$batch`).send({
      requests: [{
        id: "1",
        method: "delete",
        url: `/book('1')`
      }]
    });
    assertSuccess(res);
    res.body.should.deepEqual({
      responses: [{
        id: "1",
        status: 204,
        statusText: "No Content"
      }]
    });
  });

  it('should work with unbound action', async function () {
    const res = await request(host).post(`/$batch`).send({
      requests: [{
        id: "1",
        method: "post",
        url: `/unbound-action`
      }]
    });
    assertSuccess(res);
    res.body.should.deepEqual({
      responses: [{
        id: "1",
        status: 200,
        statusText: "OK",
        headers: {
          "OData-Version": "4.0",
          "content-type": "application/json"
        },
        body: {
          result: 'Hello! I am an unbound action.'
        }
      }]
    });
  });

  it('should work with action, that bound to entity', async function () {
    const res = await request(host).post(`/$batch`).send({
      requests: [{
        id: "1",
        method: "post",
        url: `/book(${books[0].id})/entity-action`
      }]
    });
    assertSuccess(res);
    res.body.should.deepEqual({
      responses: [{
        id: "1",
        status: 200,
        statusText: "OK",
        headers: {
          "OData-Version": "4.0",
          "content-type": "application/json"
        },
        body: {
          result: 'Hello! I am an action, that bound to entity.'
        }
      }]
    });
  });
/*
  it('should work with multipart request body', async function () {
    const result = {
      title: "War and peace"
    };
    const res = await request(host)
      .post(`/$batch`)
      .send({})
      .set('Content-Type', 'multipart/mixed; boundary=batch_1')
      .set('Host', host)
      .serialize(() => `
--batch_1
Content-Type: application/http

POST /book
Host: ${host}
Content-Type: application/json
Content-Length: ${JSON.stringify(result).length}

${JSON.stringify(result)}
--batch_1--
      `);

    assertSuccess(res);

    res.text.should.equal(`
--batch-1
Content-Type: application/http

HTTP/1.1 200 Ok
Content-Type: application/json
Content-Length: ${JSON.stringify(result).length}

${JSON.stringify(result)}
--batch-1—
    `);
  });*/
});
