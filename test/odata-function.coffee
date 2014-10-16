should = require("should")
request = require("supertest")
sinon = require("sinon")

example = require("../examples/books-list")
app = example.app
books = undefined

describe "[odata function]", ->
  before (done) ->
    example.ready ->
      books = example.books
      done()

  it "should work", (done) ->
    request(app)
      .get("/odata/license")
      .expect(200)
      .expect('Content-Type', /json/)
      .end (err, res) ->
        if(err)
          done(err)
          return
        res.body.license.should.be.equal('MIT')
        done()
