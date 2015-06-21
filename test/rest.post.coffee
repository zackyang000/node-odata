should = require('should')
request = require('supertest')
odata = require('../.')

bookSchema =
  author: String
  description: String
  genre: String
  price: Number
  publish_date: Date
  title: String

describe 'rest.post', ->
  app = undefined

  before (done) ->
    conn = 'mongodb://localhost/odata-test'
    server = odata(conn)
    server.register
      url: 'book'
      model: bookSchema
    app = server._app
    done()

  it 'should create new resource', (done) ->
    request(app)
      .post("/odata/book")
      .send
        title: 'Steve Jobs'
      .expect(201)
      .end (err, res) ->
        return done(err)  if(err)
        res.body.should.be.have.property('id')
        res.body.should.be.have.property('title')
        res.body.title.should.be.equal('Steve Jobs')
        done()

  it 'should be 422 if post without data', (done) ->
    request(app)
      .post("/odata/book")
      .expect(422, done)
