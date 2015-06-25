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

describe 'odata.query.filter', ->
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

  describe '[Equal]', ->
    it 'should filter items', (done) ->
      request(app)
        .get("/odata/book?$filter=title eq '#{books[1].title}'")
        .expect(200)
        .end (err, res) ->
          return done(err)  if(err)
          res.body.value.length.should.be.equal(1)
          res.body.value[0].title.should.be.equal(books[1].title)
          done()
    it 'should filter items when it has extra spaces at begin', (done) ->
      request(app)
        .get("/odata/book?$filter=   title eq '#{books[1].title}'")
        .expect(200)
        .end (err, res) ->
          return done(err)  if(err)
          res.body.value.length.should.be.equal(1)
          res.body.value[0].title.should.be.equal(books[1].title)
          done()
    it 'should filter items when it has extra spaces at mid', (done) ->
      request(app)
        .get("/odata/book?$filter=title   eq   '#{books[1].title}'")
        .expect(200)
        .end (err, res) ->
          return done(err)  if(err)
          res.body.value.length.should.be.equal(1)
          res.body.value[0].title.should.be.equal(books[1].title)
          done()
    it 'should filter items when it has extra spaces at end', (done) ->
      request(app)
        .get("/odata/book?$filter=title eq '#{books[1].title}'   ")
        .expect(200)
        .end (err, res) ->
          return done(err)  if(err)
          res.body.value.length.should.be.equal(1)
          res.body.value[0].title.should.be.equal(books[1].title)
          done()

  describe "'Not equal'", ->
    it 'should filter items', (done) ->
      request(app)
        .get("/odata/book?$filter=title ne '#{books[1].title}'")
        .expect(200)
        .end (err, res) ->
          return done(err)  if(err)
          res.body.value.should.matchEach((item) -> item.title != books[1].title)
          done()

  describe "'Greater than'", ->
    it 'should filter items', (done) ->
      request(app)
        .get("/odata/book?$filter=price gt 36.95")
        .expect(200)
        .end (err, res) ->
          return done(err)  if(err)
          res.body.value.length.should.greaterThan(0)
          res.body.value.should.matchEach((item) -> item.price > 36.95)
          done()

  describe '[Greater than or equal]', ->
    it 'should filter items', (done) ->
      request(app)
        .get("/odata/book?$filter=price ge 36.95")
        .expect(200)
        .end (err, res) ->
          return done(err)  if(err)
          res.body.value.length.should.greaterThan(0)
          res.body.value.should.matchEach((item) -> item.price >= 36.95)
          done()

  describe '[Less than]', ->
    it 'should filter items', (done) ->
      request(app)
        .get("/odata/book?$filter=price lt 36.95")
        .expect(200)
        .end (err, res) ->
          return done(err)  if(err)
          res.body.value.length.should.greaterThan(0)
          res.body.value.should.matchEach((item) -> item.price < 36.95)
          done()

  describe '[Less than or equal]', ->
    it 'should filter items', (done) ->
      request(app)
        .get("/odata/book?$filter=price le 36.95")
        .expect(200)
        .end (err, res) ->
          return done(err)  if(err)
          res.body.value.length.should.greaterThan(0)
          res.body.value.should.matchEach((item) -> item.price <= 36.95)
          done()

  describe '[Logical and]', ->
    it "should filter items", (done) ->
      request(app)
        .get("/odata/book?$filter=title ne '#{books[1].title}' and price ge 36.95")
        .expect(200)
        .end (err, res) ->
          return done(err)  if(err)
          res.body.value.length.should.greaterThan(0)
          res.body.value.should.matchEach((item) -> item.title != books[1].title && item.price >= 36.95)
          done()
    it "should filter items when it has extra spaces", (done) ->
      request(app)
        .get("/odata/book?$filter=title ne '#{books[1].title}'   and   price ge 36.95")
        .expect(200)
        .end (err, res) ->
          return done(err)  if(err)
          res.body.value.length.should.greaterThan(0)
          res.body.value.should.matchEach((item) -> item.title != books[1].title && item.price >= 36.95)
          done()
