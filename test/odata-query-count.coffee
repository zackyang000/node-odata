should = require("should")
request = require("supertest")
sinon = require("sinon")

example = require("../examples/books-list")
app = example.app
books = undefined

describe "[odata query count]", ->
  before (done) ->
    example.ready ->
      books = example.books
      done()

  it "should get count", (done) ->
    request(app)
      .get("/odata/books?$count=true")
      .expect(200)
      .expect('Content-Type', /json/)
      .end (err, res) ->
        if(err)
          done(err)
          return
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
        if(err)
          done(err)
          return
        res.body.should.be.not.have.property('@odata.count')
        done()
  it "should 500 when $count isn't 'true' or 'false'", (done) ->
    request(app)
      .get("/odata/books?$count=1")
      .expect(500, done)