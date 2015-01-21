should = require("should")
request = require("supertest")

require("../examples/basic")
support = require('./support')
app = undefined
books = undefined

describe "odata query count", ->
  before (done) ->
    support.ready ->
      app = support.app
      books = support.books
      done()

  it "should get count", (done) ->
    request(app)
      .get("/odata/books?$count=true")
      .expect(200)
      .expect('Content-Type', /json/)
      .end (err, res) ->
        return done(err)  if(err)
        res.body.should.be.have.property('@odata.count')
        res.body.should.be.have.property('value')
        res.body['@odata.count'].should.be.equal(res.body.value.length)
        done()
  it "should not get count", (done) ->
    request(app)
      .get("/odata/books?$count=false")
      .expect(200)
      .expect('Content-Type', /json/)
      .end (err, res) ->
        return done(err)  if(err)
        res.body.should.be.not.have.property('@odata.count')
        done()
  it "should 500 when $count isn't 'true' or 'false'", (done) ->
    request(app)
      .get("/odata/books?$count=1")
      .expect(500, done)
