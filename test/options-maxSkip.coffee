should = require("should")
request = require("supertest")

support = require('./support')
app = undefined
books = undefined
server = undefined

describe "options of maxTop", ->
  before (done) ->
    support.ready ->
      app = support.app
      books = support.books
      server = support.server
      server.set 'maxTop', 2
      done()

  it "should work", (done) ->
    request(app)
      .get("/odata/books")
      .end (err, res) ->
        return done(err)  if(err)
        res.body.value.length.should.be.equal(2)
        done()
