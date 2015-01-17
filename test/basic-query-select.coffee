should = require("should")
request = require("supertest")

require("../examples/basic")
support = require('./support')
app = undefined
books = undefined

describe "[odata query select]", ->
  before (done) ->
    support.ready ->
      app = support.app
      books = support.books
      done()

  it "should select anyone field", (done) ->
    request(app)
      .get("/odata/books?$select=price")
      .expect(200)
      .expect('Content-Type', /json/)
      .end (err, res) ->
        if(err)
          done(err)
          return
        res.body.value[0].should.be.have.property('price')
        res.body.value[0].should.be.not.have.property('title')
        res.body.value[0].should.be.not.have.property('_id')
        done()
  it "should select multiple field", (done) ->
    request(app)
      .get("/odata/books?$select=price,title")
      .expect(200)
      .expect('Content-Type', /json/)
      .end (err, res) ->
        if(err)
          done(err)
          return
        res.body.value[0].should.be.have.property('price')
        res.body.value[0].should.be.have.property('title')
        res.body.value[0].should.be.not.have.property('_id')
        done()
  it "should select multiple field with blank space", (done) ->
    request(app)
      .get("/odata/books?$select=price,     title")
      .expect(200)
      .expect('Content-Type', /json/)
      .end (err, res) ->
        if(err)
          done(err)
          return
        res.body.value[0].should.be.have.property('price')
        res.body.value[0].should.be.have.property('title')
        res.body.value[0].should.be.not.have.property('_id')
        done()
  it "should select _id field", (done) ->
    request(app)
      .get("/odata/books?$select=price,title,_id")
      .expect(200)
      .expect('Content-Type', /json/)
      .end (err, res) ->
        if(err)
          done(err)
          return
        res.body.value[0].should.be.have.property('price')
        res.body.value[0].should.be.have.property('title')
        res.body.value[0].should.be.have.property('_id')
        done()
###
  it "should 500 when select not exist field", (done) ->
    request(app)
      .get("/odata/books?$select=not-exist-field")
      .expect(500, done)
###
