should = require("should")
request = require("supertest")

require("../examples/basic")
support = require('./support')
app = undefined
books = undefined

describe "basic CRUD", ->
  before (done) ->
    support.ready ->
      app = support.app
      books = support.books
      done()

  describe "GET:", ->
    it "should get all of the resources", (done) ->
      request(app)
        .get("/odata/books")
        .expect(200)
        .expect('Content-Type', /json/)
        .end (err, res) ->
          return done(err)  if(err)
          res.body.should.be.have.property('value')
          res.body.value.length.should.be.equal(books.length)
          done()
    it "should get one of the resources", (done) ->
      request(app)
        .get("/odata/books/#{books[1].id}")
        .expect(200)
        .expect('Content-Type', /json/)
        .end (err, res) ->
          return done(err)  if(err)
          res.body.should.be.have.property('title')
          res.body.title.should.be.equal(books[1].title)
          done()

  describe "POST:", ->
    it "should create new resource", (done) ->
      request(app)
        .post("/odata/books")
        .send
          author: "Walter Isaacson",
          description: "FROM THE AUTHOR OF THE BESTSELLING BIOGRAPHIES OF BENJAMIN FRANKLIN AND ALBERT EINSTEIN, THIS IS THE EXCLUSIVE BIOGRAPHY OF STEVE JOBS.",
          genre: "Computer",
          price: 19.65,
          publish_date: "2013-09-10",
          title: "Steve Jobs"
        .expect(201)
        .expect('Content-Type', /json/)
        .end (err, res) ->
          return done(err)  if(err)
          res.body.should.be.have.property('id')
          res.body.should.be.have.property('title')
          res.body.title.should.be.equal("Steve Jobs")
          done()
    it "should not create new resource if post nothing", (done) ->
      request(app)
        .post("/odata/books")
        .expect(422, done)

  describe "PUT:", ->
    it "should modify resource if it exist", (done) ->
      books[2].title = "I'm a new title"
      request(app)
        .put("/odata/books/#{books[2].id}")
        .send(books[2])
        .expect(200)
        .expect('Content-Type', /json/)
        .end (err, res) ->
          return done(err)  if(err)
          res.body.should.be.have.property('title')
          res.body.title.should.be.equal(books[2].title)
          done()
    it "should not modify resource if it not exist", (done) ->
      request(app)
        .put("/odata/books/000000000000000000000000")
        .send(books[3])
        .expect(404, done)
    it "should not modify resource if not use id", (done) ->
      request(app)
        .put("/odata/books")
        .send(books[4])
        .expect(404, done)
    it "should not modify resource if id is a wrong format", (done) ->
      request(app)
        .put("/odata/books/put-wrong-id")
        .send(books[5])
        .expect(404, done)

  describe "DELETE:", ->
    it "should delete resource if it exist", (done) ->
      request(app)
        .del("/odata/books/#{books[6].id}")
        .expect(200, done)
    it "should not delete resource if it not exist", (done) ->
      request(app)
        .del("/odata/books/000000000000000000000001")
        .expect(404, done)
    it "should not delete resource if not use id", (done) ->
      request(app)
        .del("/odata/books")
        .expect(404, done)
    it "should not delete resource if id is a wrong format", (done) ->
      request(app)
        .del("/odata/books/del-wrong-id")
        .expect(404, done)
    it "should not delete a resource twice", (done) ->
      request(app)
        .del("/odata/books/#{books[7].id}")
        .end (err, res) ->
          request(app)
            .del("/odata/books/#{books[7].id}")
            .expect(404, done)
