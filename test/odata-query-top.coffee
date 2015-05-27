should = require("should")
request = require("supertest")

support = require('./support')
app = undefined
books = undefined

describe "OData query top", ->
  before (done) ->
    support.ready ->
      app = support.app
      books = support.books
      done()

  it "should top items", (done) ->
    request(app)
      .get("/odata/books?$top=1")
      .expect(200)
      .expect('Content-Type', /json/)
      .end (err, res) ->
        return done(err)  if(err)
        res.body.value.length.should.be.equal(1)
        done()
  it "should ignore when top not a number", (done) ->
    request(app)
      .get("/odata/books?$top=not-a-number")
      .expect(200)
      .end (err, res) ->
        return done(err)  if(err)
        res.body.value.length.should.be.equal(books.length)
        done()
  it "should ignore when top not a positive number", (done) ->
    request(app)
      .get("/odata/books?$top=-1")
      .expect(200)
      .end (err, res) ->
        return done(err)  if(err)
        res.body.value.length.should.be.equal(books.length)
        done()
