should = require("should")
request = require("supertest")
sinon = require("sinon")

example = require("../examples/books-list")
app = example.app
books = undefined

describe "[basic CRUD]", ->
  before (done) ->
    example.ready ->
      books = example.books
      done()

  describe "GET:", ->
    it "should be successful to get all of the resources", (done) ->
      request(app).get("/odata/books")
        .expect(200)
        .expect('Content-Type', /json/)
        .end (err, res) ->
          res.body.should.be.have.property('value')
          res.body.value.length.should.be.equal(books.length)
          res.body.value[0].title.should.be.equal(books[0].title)
          done(err)
    it "should be successful to get all of the resources", (done) ->
      request(app).get("/odata/books/#{books[1]._id}")
        .expect(200)
        .expect('Content-Type', /json/)
        .end (err, res) ->
          res.body.should.be.have.property('title')
          res.body.title.should.be.equal(books[1].title)
          done(err)

  describe "PUT:", ->
    it "should be successful to edit a exist resource", (done) ->
      request(app).post("/odata/books")
        .send
          author: "Walter Isaacson",
          description: "FROM THE AUTHOR OF THE BESTSELLING BIOGRAPHIES OF BENJAMIN FRANKLIN AND ALBERT EINSTEIN, THIS IS THE EXCLUSIVE BIOGRAPHY OF STEVE JOBS.",
          genre: "Computer",
          id: "xx999",
          price: 19.65,
          publish_date: "2013-09-10",
          title: "Steve Jobs"
        .expect(201) #todo 修改200为201
        .expect('Content-Type', /json/)
        .end (err, res) ->
          res.body.should.be.have.property('_id')
          res.body.should.be.have.property('title') #todo 未返回实体
          res.body.value[0].title.should.be.equal("Steve Jobs")
          done(err)

  describe "POST:", ->
    it "should be successful to edit a exist resource", (done) ->
      done()

  describe "DELETE:", ->
    it "should be successful to delete a exist resource", (done) ->
      done()
