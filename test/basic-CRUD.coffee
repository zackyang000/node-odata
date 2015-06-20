should = require("should")
request = require("supertest")
odata = require('../.')
support = require('./support')

bookSchema =
  author: String
  description: String
  genre: String
  price: Number
  publish_date: Date
  title: String

describe 'get', ->
  conn = 'mongodb://localhost/odata-test'
  app = undefined
  books = undefined

  before (done) ->
    server = odata(conn)
    server.register
      url: 'book'
      model: bookSchema
    app = server._app
    support conn, (data) ->
      books = data
      done()

  it "should get all of the resources", (done) ->
    request(app)
      .get("/odata/book")
      .expect(200)
      .expect('Content-Type', /json/)
      .end (err, res) ->
        return done(err)  if(err)
        res.body.should.be.have.property('value')
        res.body.value.length.should.be.equal(books.length)
        done()
