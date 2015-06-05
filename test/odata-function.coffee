should = require("should")
request = require("supertest")

support = require('./support')
app = undefined
books = undefined

describe "OData function", ->
  before (done) ->
    support.ready ->
      app = support.app
      books = support.books
      done()

  it "should work", (done) ->
    request(app)
      .get("/odata/license")
      .expect(200)
      .expect('Content-Type', /json/)
      .end (err, res) ->
        return done(err)  if(err)
        res.body.license.should.be.equal('MIT')
        done()
