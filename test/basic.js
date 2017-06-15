require('should');
const supertest = require('supertest');
const { conn, bookSchema, initData } = require('./support/setup');
const odata = require('../');

class Book extends odata.Resource {
  constructor() {
    super('book', bookSchema);
  }
}

describe('rest.get', () => {
  let data, request;

  before(async function() {
    data = await initData();
    const app = new odata({ conn });
    const server = app.listen();
    request = supertest(server);
    console.log('=====Object======');
    app.use(Book);
    // console.log('=====Array======');
    // app.use([Book, Book]);
  });

  it('should return all of the resources', async function() {
    const res = await request.get(`/book`);
    console.log('body', res.body)
    res.body.should.be.have.property('value');
    res.body.value.length.should.be.equal(data.length);
  });
});
