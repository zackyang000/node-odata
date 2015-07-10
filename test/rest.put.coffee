should = require('should')
request = require('supertest')
uuid = require('node-uuid')
odata = require('../.')
support = require('./support')

PORT = 0

bookSchema =
  author: String
  description: String
  genre: String
  price: Number
  publish_date: Date
  title: String

books = undefined

describe 'rest.put', ->
  before (done) ->
    conn = 'mongodb://localhost/odata-test'
    server = odata(conn)
    server.resource 'book', bookSchema
    support conn, (data) ->
      books = data
      s = server.listen PORT, ->
        PORT = s.address().port
        done()

  it 'should modify resource', (done) ->
    books[0].title = 'modify title'
    request("http://localhost:#{PORT}")
      .put("/book(#{books[0].id})")
      .send(books[0])
      .expect(200)
      .end (err, res) ->
        return done(err)  if(err)
        res.body.should.be.have.property('title')
        res.body.title.should.be.equal(books[0].title)
        done()

  it 'should create resource if with a new id', (done) ->
    id = uuid.v4()
    title = 'new title'
    request("http://localhost:#{PORT}")
      .put("/book(#{id})")
      .send
        title: title
      .expect(201)
      .end (err, res) ->
        return done(err)  if(err)
        res.body.should.be.have.property('title')
        res.body.title.should.be.equal(title)
        res.body.should.be.have.property('id')
        res.body.id.should.be.equal(id)
        done()

  it 'should be 404 if without id', (done) ->
    request("http://localhost:#{PORT}")
      .put("/book")
      .send(books[0])
      .expect(404, done)

  it "should 400 if with a wrong id", (done) ->
    request("http://localhost:#{PORT}")
      .put("/book(wrong-id)")
      .send(books[0])
      .expect(400, done)
