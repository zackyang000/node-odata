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

describe 'odata.query.filter.functions', ->

  before (done) ->
    conn = 'mongodb://localhost/odata-test'
    server = odata(conn)
    server.resource 'book', bookSchema
    support conn, (data) ->
      books = data
      s = server.listen PORT, ->
        PORT = s.address().port
        done()

  describe '[indexof]', ->
    it 'should filter items', (done) ->
      request("http://localhost:#{PORT}")
        .get("/book?$filter=indexof(title,'i') ge 1")
        .expect(200)
        .end (err, res) ->
          return done(err)  if(err)
          res.body.value.length.should.greaterThan(0)
          res.body.value.should.matchEach((item) -> item.title.indexOf('i') >= 1)
          done()
    it 'should filter items when it has extra spaces in query string', (done) ->
      request("http://localhost:#{PORT}")
        .get("/book?$filter=indexof(title,'Visual Studio') ge 0")
        .expect(200)
        .end (err, res) ->
          return done(err)  if(err)
          res.body.value.length.should.greaterThan(0)
          res.body.value.should.matchEach((item) -> item.title.indexOf('Visual Studio') >= 0)
          done()

  describe '[year]', ->
    it 'should filter items', (done) ->
      request("http://localhost:#{PORT}")
        .get("/book?$filter=year(publish_date) eq 2000")
        .expect(200)
        .end (err, res) ->
          return done(err)  if(err)
          res.body.value.length.should.greaterThan(0)
          res.body.value.should.matchEach((item) -> new Date(item.publish_date).getFullYear() == 2000)
          done()
