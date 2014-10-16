should = require("should")
request = require("supertest")
sinon = require("sinon")

example = require("../examples/books-list")
app = example.app
books = undefined

describe "[odata query top]", ->
  before (done) ->
    example.ready ->
      books = example.books
      done()

  it "should top items", (done) ->
    request(app)
      .get("/odata/books?$top=1")
      .expect(200)
      .expect('Content-Type', /json/)
      .end (err, res) ->
        res.body.value.length.should.be.equal(1)
        done()
  it "should 500 when top not a number", (done) ->
    request(app)
      .get("/odata/books?$top=not-a-number")
      .expect(500, done)
  it "should 500 when top not a positive number", (done) ->
    request(app)
      .get("/odata/books?$top=-1")
      .expect(500, done)
