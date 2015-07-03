should = require('should')
request = require('supertest')
odata = require('../.')
support = require('./support')

bookSchema =
  author: String
  description: String
  genre: String
  price: Number
  publish_date: Date
  title: String

describe 'odata.query.top', ->
  app = undefined
  books = undefined

  before (done) ->
    conn = 'mongodb://localhost/odata-test'
    server = odata(conn)
    server.register
      url: 'book'
      model: bookSchema
    app = server._app
    support conn, (data) ->
      books = data
      done()

  it 'should top items', (done) ->
    request(app)
      .get("/book?$top=1")
      .expect(200)
      .end (err, res) ->
        return done(err)  if(err)
        res.body.value.length.should.be.equal(1)
        done()

  it 'should igonore when top not a number', (done) ->
    request(app)
      .get("/book?$top=not-a-number")
      .expect(200)
      .end (err, res) ->
        return done(err)  if(err)
        res.body.value.length.should.be.equal(books.length)
        done()

  it 'should ignore when top not a positive number', (done) ->
    request(app)
      .get("/book?$top=-1")
      .expect(200)
      .end (err, res) ->
        return done(err)  if(err)
        res.body.value.length.should.be.equal(books.length)
        done()
