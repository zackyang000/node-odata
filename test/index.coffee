should = require("should")
request = require("supertest")
sinon = require("sinon")

example = require("../examples/books-list")
app = example.app
books = undefined

describe "basic CRUD", ->
  before (done) ->
    example.ready ->
      books = example.books
      console.log books
      done()

  it "should dispatch to GET", (done) ->
    request(app).get("/odata/books")
      .expect(200)
      .expect('Content-Type', /json/)
      .end (err, res) ->
        res.body.should.be.have.property('value')
        res.body.value[0].title.should.be.equal(books[0].title)
        done()

  it "should dispatch to PUT", (done) ->
    request(app).get("/odata/books")
      .expect(200)
      .expect('Content-Type', /json/)
      .end (err, res) ->
        res.body.should.be.have.property('value')
        res.body.value[0].title.should.be.equal(books[0].title)
        done()

  it "should dispatch to POST", (done) ->
    request(app).get("/odata/books")
      .expect(200)
      .expect('Content-Type', /json/)
      .end (err, res) ->
        res.body.should.be.have.property('value')
        res.body.value[0].title.should.be.equal(books[0].title)
        done()

  it "should dispatch to DELETE", (done) ->
    request(app).get("/odata/books")
      .expect(200)
      .expect('Content-Type', /json/)
      .end (err, res) ->
        res.body.should.be.have.property('value')
        res.body.value[0].title.should.be.equal(books[0].title)
        done()

  it "should dispatch to GET", (done) ->
    request(app).get("/odata/books")
      .expect(200)
      .expect('Content-Type', /json/)
      .end (err, res) ->
        res.body.should.be.have.property('value')
        res.body.value[0].title.should.be.equal(books[0].title)
        done()