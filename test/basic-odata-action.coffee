should = require("should")
request = require("supertest")

support = require('./support')
app = undefined
books = undefined

describe "odata action", ->
  before (done) ->
    support.ready ->
      app = support.app
      books = support.books
      done()

  it "should work", (done) ->
    request(app)
      .post("/odata/books/#{books[10].id}/50off")
      .expect(200)
      .expect('Content-Type', /json/)
      .end (err, res) ->
        return done(err)  if(err)
        res.body.price.should.be.equal(+((books[10].price/2).toFixed(2)))
        done()
