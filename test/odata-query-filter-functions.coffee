should = require("should")
request = require("supertest")
sinon = require("sinon")

example = require("../examples/books-list")
app = example.app
books = undefined

describe "[odata query filter functions]", ->
  before (done) ->
    example.ready ->
      books = example.books
      done()
  describe "'indexof'", ->
    it "should filter items", (done) ->
      request(app)
        .get("/odata/books?$filter=indexof(title,'i') ge 1")
        .expect(200)
        .expect('Content-Type', /json/)
        .end (err, res) ->
          return done(err)  if(err)
          res.body.value.length.should.greaterThan(0)
          res.body.value.should.matchEach((item) -> item.title.indexOf('i') >= 1)
          done()
    it "should filter items when it has extra spaces in query string", (done) ->
      request(app)
        .get("/odata/books?$filter=indexof(title,'Visual Studio') ge 0")
        .expect(200)
        .expect('Content-Type', /json/)
        .end (err, res) ->
          return done(err)  if(err)
          res.body.value.length.should.greaterThan(0)
          res.body.value.should.matchEach((item) -> item.title.indexOf('Visual Studio') >= 0)
          done()
  describe "'year'", ->
    it "should filter items", (done) ->
      request(app)
        .get("/odata/books?$filter=year(publish_date) eq 2000")
        .expect(200)
        .expect('Content-Type', /json/)
        .end (err, res) ->
          return done(err)  if(err)
          res.body.value.length.should.greaterThan(0)
          res.body.value.should.matchEach((item) -> new Date(item.publish_date).getFullYear() == 2000)
          done()