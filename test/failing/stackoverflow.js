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
    books = JSON.parse(JSON.stringify(db.addData('book', data)));
    httpServer = server.listen(port);
    sandbox = sinon.createSandbox();
  });

  afterEach(() => {
    httpServer.close();
    sandbox.restore();
  });

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
  });
});
