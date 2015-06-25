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

describe 'odata.query.filter.functions', ->
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

  describe '[indexof]', ->
    it 'should filter items', (done) ->
      request(app)
        .get("/odata/book?$filter=indexof(title,'i') ge 1")
        .expect(200)
        .end (err, res) ->
          return done(err)  if(err)
          res.body.value.length.should.greaterThan(0)
          res.body.value.should.matchEach((item) -> item.title.indexOf('i') >= 1)
          done()
    it 'should filter items when it has extra spaces in query string', (done) ->
      request(app)
        .get("/odata/book?$filter=indexof(title,'Visual Studio') ge 0")
        .expect(200)
        .end (err, res) ->
          return done(err)  if(err)
          res.body.value.length.should.greaterThan(0)
          res.body.value.should.matchEach((item) -> item.title.indexOf('Visual Studio') >= 0)
          done()

  describe '[year]', ->
    it 'should filter items', (done) ->
      request(app)
        .get("/odata/book?$filter=year(publish_date) eq 2000")
        .expect(200)
        .end (err, res) ->
          return done(err)  if(err)
          res.body.value.length.should.greaterThan(0)
          res.body.value.should.matchEach((item) -> new Date(item.publish_date).getFullYear() == 2000)
          done()
