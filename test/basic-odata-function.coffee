should = require("should")
request = require("supertest")
sinon = require("sinon")

require("../examples/basic")
support = require('./support')
app = undefined
books = undefined

describe "[odata function]", ->
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
        if(err)
          done(err)
          return
        res.body.license.should.be.equal('MIT')
        done()
