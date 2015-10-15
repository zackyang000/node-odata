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

describe 'odata.query.top', ->

  before (done) ->
    conn = 'mongodb://localhost/odata-test'
    server = odata(conn)
    server.resource 'book', bookSchema
    support conn, (data) ->
      books = data
      s = server.listen PORT, ->
        PORT = s.address().port
        done()

  it 'should top items', (done) ->
    request("http://localhost:#{PORT}")
      .get("/book?$top=1")
      .expect(200)
      .end (err, res) ->
        return done(err)  if(err)
        res.body.value.length.should.be.equal(1)
        done()

  it 'should iginre when top not a number', (done) ->
    request("http://localhost:#{PORT}")
      .get("/book?$top=not-a-number")
      .expect(200)
      .end (err, res) ->
        return done(err)  if(err)
        res.body.value.length.should.be.equal(books.length)
        done()

  it 'should ignore when top not a positive number', (done) ->
    request("http://localhost:#{PORT}")
      .get("/book?$top=-1")
      .expect(200)
      .end (err, res) ->
        return done(err)  if(err)
        res.body.value.length.should.be.equal(books.length)
        done()
