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
          if(err)
            done(err)
            return
          res.body.value.length.should.greaterThan(0)
          res.body.value.should.matchEach((item) -> item.title.indexOf('i') >= 1)
          done()
