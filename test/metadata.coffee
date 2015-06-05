should = require("should")
request = require("supertest")

support = require('./support')
app = undefined
books = undefined

describe "Metadata", ->
  before (done) ->
    support.ready ->
      app = support.app
      books = support.books
      done()

  it "should work", (done) ->
    request(app)
      .get("/odata")
      .expect(200)
      .end (err, res) ->
        return done(err)  if(err)
        res.body.should.be.have.property('resources')
        res.body.resources.should.be.have.property('books')
        res.body.resources.books.should.be.have.property('title')
        res.body.resources.books.title.should.be.equal('String')
        done()
