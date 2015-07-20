should = require('should')
request = require('supertest')
odata = require('../.')
support = require('./support')

PORT = 0

bookSchema =
  author: String
  description: String
  genre: String
  price: Number
  publish_date: Date
  title: String

books = undefined

describe 'odata.query.skip', ->
  before (done) ->
    conn = 'mongodb://localhost/odata-test'
    server = odata(conn)
    server.resource 'book', bookSchema
    support conn, (data) ->
      books = data
      s = server.listen PORT, ->
        PORT = s.address().port
        done()

  it 'should skip items', (done) ->
    firstBook = books[0]
    request("http://localhost:#{PORT}")
      .get("/book?$skip=1")
      .expect(200)
      .end (err, res) ->
        res.body.value.length.should.be.equal(books.length - 1)
        done()

  it 'should ignore when skip over count of items', (done) ->
    request("http://localhost:#{PORT}")
      .get("/book?$skip=1024")
      .expect(200)
      .end (err, res) ->
        return done(err)  if(err)
        res.body.value.length.should.be.equal(0)
        done()

  it 'should ignore when skip not a number', (done) ->
    request("http://localhost:#{PORT}")
      .get("/book?$skip=not-a-number")
      .expect(200)
      .end (err, res) ->
        return done(err)  if(err)
        res.body.value.length.should.be.equal(books.length)
        done()
        
  it 'should ignore when skip not a positive number', (done) ->
    request("http://localhost:#{PORT}")
      .get("/book?$skip=-1")
      .expect(200)
      .end (err, res) ->
        return done(err)  if(err)
        res.body.value.length.should.be.equal(books.length)
        done()

