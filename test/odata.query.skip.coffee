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

describe 'odata.query.skip', ->
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

  it 'should skip items', (done) ->
    firstBook = books[0]
    request(app)
      .get("/odata/book?$skip=1")
      .expect(200)
      .end (err, res) ->
        res.body.value.length.should.be.equal(books.length - 1)
        done()

  it 'should not items when skip over count of items', (done) ->
    request(app)
      .get("/odata/book?$skip=1024")
      .expect(200)
      .end (err, res) ->
        return done(err)  if(err)
        res.body.value.length.should.be.equal(0)
        done()

  it 'should ignore when skip not a number', (done) ->
    request(app)
      .get("/odata/book?$skip=not-a-number")
      .expect(200)
      .end (err, res) ->
        return done(err)  if(err)
        res.body.value.length.should.be.equal(books.length)
        done()
        
  it 'should ignore when skip not a positive number', (done) ->
    request(app)
      .get("/odata/book?$skip=-1")
      .expect(200)
      .end (err, res) ->
        return done(err)  if(err)
        res.body.value.length.should.be.equal(books.length)
        done()

