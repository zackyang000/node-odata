should = require("should")
request = require("supertest")
sinon = require("sinon")

example = require("../examples/books-list")
app = example.app
books = undefined

describe "[odata action]", ->
  before (done) ->
    example.ready ->
      books = example.books
      done()

  it "should work", (done) ->
    request(app)
      .post("/odata/books/#{books[10]._id}/50off")
      .expect(200)
      .expect('Content-Type', /json/)
      .end (err, res) ->
        if(err)
          done(err)
          return
        res.body.price.should.be.equal(+((books[10].price/2).toFixed(2)))
        done()
