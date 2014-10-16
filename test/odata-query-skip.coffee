should = require("should")
request = require("supertest")
sinon = require("sinon")

example = require("../examples/books-list")
app = example.app
books = undefined

describe "[odata query skip]", ->
  before (done) ->
    example.ready ->
      books = example.books
      done()

  it "should skip items", (done) ->
    request(app)
      .get("/odata/books")
      .expect(200)
      .expect('Content-Type', /json/)
      .end (err, res) ->
        firstBook = res.body.value[0]
        request(app)
          .get("/odata/books?$skip=1")
          .expect(200)
          .expect('Content-Type', /json/)
          .end (err, res) ->
            res.body.value[0].title.should.not.be.equal(firstBook.title)
            done()
  it "should not items when skip over count of items", (done) ->
    request(app)
      .get("/odata/books?$skip=1024")
      .expect(200)
      .expect('Content-Type', /json/)
      .end (err, res) ->
        res.body.value.length.should.be.equal(0)
        done()
  it "should 500 when skip not a number", (done) ->
    request(app)
      .get("/odata/books?$skip=not-a-number")
      .expect(500, done)
  it "should 500 when skip not a positive number", (done) ->
    request(app)
      .get("/odata/books?$skip=-1")
      .expect(500, done)
