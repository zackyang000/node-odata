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
      done()

  after (done) ->
    server.set 'maxTop', undefined
    done()

  it "should work", (done) ->
    server.set 'maxTop', 1
    request(app)
      .get("/odata/books")
      .end (err, res) ->
        return done(err)  if(err)
        res.body.value.length.should.be.equal(1)
        done()

  it "should use global-limit if it is minimum between global-limit and query-limit", (done) ->
    server.set 'maxTop', 2
    request(app)
      .get("/odata/books?$top=3")
      .end (err, res) ->
        return done(err)  if(err)
        res.body.value.length.should.be.equal(2)
        done()

  it "should use query-limit if it is minimum between global-limit and query-limit", (done) ->
    server.set 'maxTop', 4
    request(app)
      .get("/odata/books?$top=3")
      .end (err, res) ->
        return done(err)  if(err)
        res.body.value.length.should.be.equal(3)
        done()

  #todo: check correctness between global-limit, resource-limit and query-limit.
