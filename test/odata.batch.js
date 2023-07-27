import 'should';
import request from 'supertest';
import { odata, host, port, assertSuccess } from './support/setup';
import data from './support/books.json';
import { BookMetadata } from './support/books.model';

describe('odata.batch', () => {
  const books = data;
  let httpServer, resource, sandbox;

  afterEach(() => {
    httpServer.close();
  });

  it('should work with get lists', async function () {
    const result = books.filter(item => item.title.indexOf('Guide') >= 0)
      .map(item => ({ title: item.title }));
    const server = odata();

    server.entity('book', {
      list: (req, res, next) => {
        req.$odata.$filter.should.deepEqual({
          title: {
            $function: {
              $name: 'contains',
              $parameter: 'Guide',
              $operator: undefined,
              $value: undefined
            }
          }
        });
        req.$odata.$select.should.deepEqual(['title']);
        res.$odata.result = {
          value: result
        };
        next();
      }
    }, BookMetadata);
    httpServer = server.listen(port);

    const res = await request(host).post(`/$batch`).send({
      requests: [{
        id: "1",
        method: "get",
        url: `/book?$filter=contains(title, 'Guide')&$select=title`
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
        body: {
          value: result
        }
      }]
    });
  });

  it('should work with get entity', async function () {
    const server = odata();

    server.entity('book', {
      get: (req, res, next) => {
        req.$odata.$Key.id.should.be.equal(books[0].id);
        res.$odata.result = books[0];
        next();
      }
    }, BookMetadata);
    httpServer = server.listen(port);

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
    const server = odata();

    server.entity('book', {
      post: (req, res, next) => {
        req.$odata.body.should.deepEqual(result);
        res.$odata.result = {
          id: "AFFE",
          ...result
        };
        res.$odata.status = 201;
        next();
      }
    }, BookMetadata);
    httpServer = server.listen(port);

    const res = await request(host).post(`/$batch`).send({
      requests: [{
        id: "1",
        method: "post",
        url: `/book`,
        body: result
      }]
    });
    assertSuccess(res);
    res.body.should.deepEqual({
      responses: [{
        id: "1",
        status: 201,
        statusText: 'Created',
        headers: {
          'OData-Version': '4.0',
          'content-type': 'application/json'
        },
        body: {
          id: "AFFE",
          ...result
        }
      }]
    });
  });

  it('should work with put entity', async function () {
    const result = {
      id: "1",
      title: "War and peace"
    };
    const server = odata();

    server.entity('book', {
      put: (req, res, next) => {
        req.$odata.body.should.deepEqual(result);
        req.$odata.$Key.id.should.be.equal(result.id);
        res.$odata.result = result;
        next();
      }
    }, BookMetadata);
    httpServer = server.listen(port);

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
    const server = odata();

    server.entity('book', {
      patch: (req, res, next) => {
        req.$odata.body.should.deepEqual(result);
        req.$odata.$Key.id.should.be.equal(result.id);
        res.$odata.result = result;
        next();
      }
    }, BookMetadata);
    httpServer = server.listen(port);

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
    const server = odata();

    server.entity('book', {
      delete: (req, res, next) => {
        req.$odata.$Key.id.should.be.equal('1');
        res.$odata.status = 204;
        next();
      }
    }, BookMetadata);
    httpServer = server.listen(port);

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
    const server = odata();

    server.action('unbound-action', (req, res, next) => {
      res.$odata.result = { result: 'Hello! I am an unbound action.' };
      next();
    });
    httpServer = server.listen(port);

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
    const server = odata();
    const resource = server.entity('book', {
    }, BookMetadata);
    resource.action('entity-action', (req, res, next) => {
      req.$odata.$Key.id.should.be.equal(books[0].id);
      res.$odata.result = { result: 'Hello! I am an action, that bound to entity.' };
      next();
    }, { binding: 'entity' });

    httpServer = server.listen(port);

    const res = await request(host).post(`/$batch`).send({
      requests: [{
        id: "1",
        method: "post",
        url: `/book('${books[0].id}')/entity-action`
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
