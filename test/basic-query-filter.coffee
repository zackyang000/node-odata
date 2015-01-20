should = require("should")
request = require("supertest")

require("../examples/basic")
support = require('./support')
app = undefined
books = undefined

describe "odata query filter", ->
  before (done) ->
    support.ready ->
      app = support.app
      books = support.books
      done()

  describe "'Equal'", ->
    it "should filter items", (done) ->
      request(app)
        .get("/odata/books?$filter=title eq '#{books[1].title}'")
        .expect(200)
        .expect('Content-Type', /json/)
        .end (err, res) ->
          if(err)
            done(err)
            return
          res.body.value.length.should.be.equal(1)
          res.body.value[0].title.should.be.equal(books[1].title)
          done()
    it "should filter items when it has extra spaces at begin", (done) ->
      request(app)
        .get("/odata/books?$filter=   title eq '#{books[1].title}'")
        .expect(200)
        .expect('Content-Type', /json/)
        .end (err, res) ->
          if(err)
            done(err)
            return
          res.body.value.length.should.be.equal(1)
          res.body.value[0].title.should.be.equal(books[1].title)
          done()
    it "should filter items when it has extra spaces at mid", (done) ->
      request(app)
        .get("/odata/books?$filter=title   eq   '#{books[1].title}'")
        .expect(200)
        .expect('Content-Type', /json/)
        .end (err, res) ->
          if(err)
            done(err)
            return
          res.body.value.length.should.be.equal(1)
          res.body.value[0].title.should.be.equal(books[1].title)
          done()
    it "should filter items when it has extra spaces at end", (done) ->
      request(app)
        .get("/odata/books?$filter=title eq '#{books[1].title}'   ")
        .expect(200)
        .expect('Content-Type', /json/)
        .end (err, res) ->
          if(err)
            done(err)
            return
          res.body.value.length.should.be.equal(1)
          res.body.value[0].title.should.be.equal(books[1].title)
          done()

  describe "'Not equal'", ->
    it "should filter items", (done) ->
      request(app)
        .get("/odata/books?$filter=title ne '#{books[1].title}'")
        .expect(200)
        .expect('Content-Type', /json/)
        .end (err, res) ->
          if(err)
            done(err)
            return
          res.body.value.should.matchEach((item) -> item.title != books[1].title)
          done()

  describe "'Greater than'", ->
    it "should filter items", (done) ->
      request(app)
        .get("/odata/books?$filter=price gt 36.95")
        .expect(200)
        .expect('Content-Type', /json/)
        .end (err, res) ->
          if(err)
            done(err)
            return
          res.body.value.length.should.greaterThan(0)
          res.body.value.should.matchEach((item) -> item.price > 36.95)
          done()

  describe "'Greater than or equal'", ->
    it "should filter items", (done) ->
      request(app)
        .get("/odata/books?$filter=price ge 36.95")
        .expect(200)
        .expect('Content-Type', /json/)
        .end (err, res) ->
          if(err)
            done(err)
            return
          res.body.value.length.should.greaterThan(0)
          res.body.value.should.matchEach((item) -> item.price >= 36.95)
          done()

  describe "'Less than'", ->
    it "should filter items", (done) ->
      request(app)
        .get("/odata/books?$filter=price lt 36.95")
        .expect(200)
        .expect('Content-Type', /json/)
        .end (err, res) ->
          if(err)
            done(err)
            return
          res.body.value.length.should.greaterThan(0)
          res.body.value.should.matchEach((item) -> item.price < 36.95)
          done()

  describe "'Less than or equal'", ->
    it "should filter items", (done) ->
      request(app)
        .get("/odata/books?$filter=price le 36.95")
        .expect(200)
        .expect('Content-Type', /json/)
        .end (err, res) ->
          if(err)
            done(err)
            return
          res.body.value.length.should.greaterThan(0)
          res.body.value.should.matchEach((item) -> item.price <= 36.95)
          done()

  describe "'Logical and'", ->
    it "should filter items", (done) ->
      request(app)
        .get("/odata/books?$filter=title ne '#{books[1].title}' and price ge 36.95")
        .expect(200)
        .expect('Content-Type', /json/)
        .end (err, res) ->
          if(err)
            done(err)
            return
          res.body.value.length.should.greaterThan(0)
          res.body.value.should.matchEach((item) -> item.title != books[1].title && item.price >= 36.95)
          done()
    it "should filter items when it has extra spaces", (done) ->
      request(app)
        .get("/odata/books?$filter=title ne '#{books[1].title}'   and   price ge 36.95")
        .expect(200)
        .expect('Content-Type', /json/)
        .end (err, res) ->
          if(err)
            done(err)
            return
          res.body.value.length.should.greaterThan(0)
          res.body.value.should.matchEach((item) -> item.title != books[1].title && item.price >= 36.95)
          done()
