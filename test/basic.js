require('should');
const supertest = require('supertest');
const createError = require('http-errors');
const { conn, bookSchema, initData } = require('./support/setup');
const odata = require('../');

class Book extends odata.Resource {
  constructor() {
    super('book', bookSchema);
  }

  async willQueryList(a,b) {
    console.log('willQuery:', a,b)
    return createError.UnprocessableEntity('aaa');
    //return new Error('this is a error.')
  }

  async didQueryList(a,b) {
    console.log('didQueryList', a,b)
  }
}

describe('rest.get', () => {
  let data, request;

  before(async function() {
    data = await initData();
    const app = new odata({ conn });
    const server = app.listen();
    request = supertest(server);
    app.use(Book);
  });

  it('should return all of the resources', async function() {
    const res = await request.get(`/book`);
    console.log(res.status, res.body)
    res.body.should.be.have.property('value');
    res.body.value.length.should.be.equal(data.length);
  });
});
