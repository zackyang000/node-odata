should = require("should")
request = require("supertest")

support = require('./support')
app = undefined
books = undefined
server = undefined

describe "options of maxSkip", ->
  before (done) ->
    support.ready ->
      app = support.app
      books = support.books
      server = support.server
      done()

  after (done) ->
    server.config.set 'maxSkip', undefined
    done()

  it "should use global-limit if it is minimum between global-limit and query-limit", (done) ->
    server.config.set 'maxSkip', 2
    request(app)
      .get("/odata/books?$skip=3")
      .end (err, res) ->
        return done(err)  if(err)
        res.body.value.length.should.be.equal(books.length - 2)
        done()

  it "should use query-limit if it is minimum between global-limit and query-limit", (done) ->
    server.config.set 'maxSkip', 4
    request(app)
      .get("/odata/books?$skip=3")
      .end (err, res) ->
        return done(err)  if(err)
        res.body.value.length.should.be.equal(books.length - 3)
        done()

  #todo: check correctness between global-limit, resource-limit and query-limit.
