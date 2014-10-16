should = require("should")
request = require("supertest")
sinon = require("sinon")

example = require("../examples/books-list")
app = example.app
books = undefined

describe "[odata query filter]", ->
  before (done) ->
    example.ready ->
      books = example.books
      done()
  describe "'Equal'", ->
    it "should filter items", (done) ->
      request(app)
        .get("/odata/books?$filter=title eq '#{books[1].title}'")
        .expect(200)
        .expect('Content-Type', /json/)
        .end (err, res) ->
          if(err)
            done(err)
            return
          res.body.value.length.should.be.equal(1)
          res.body.value[0].title.should.be.equal(books[1].title)
          done()

  describe "'Not equal'", ->
    it "should filter items", (done) ->
      request(app)
        .get("/odata/books?$filter=title ne '#{books[1].title}'")
        .expect(200)
        .expect('Content-Type', /json/)
        .end (err, res) ->
          if(err)
            done(err)
            return
          res.body.value.should.matchEach( (item) -> item.title != books[1].title)
          done()

  describe "'Greater than'", ->

  describe "'Greater than or equal'", ->

  describe "'Less than'", ->

  describe "'Less than or equal'", ->

  describe "'Logical and'", ->