should = require('should')
request = require('supertest')
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

describe 'rest.get', ->
  before (done) ->
    conn = 'mongodb://localhost/odata-test'
    server = odata(conn)
    server.resource 'book', bookSchema
    support conn, (data) ->
      books = data
      s = server.listen PORT, ->
        PORT = s.address().port
        done()

  it 'should return all of the resources', (done) ->
    request("http://localhost:#{PORT}")
      .get('/book')
      .expect(200)
      .end (err, res) ->
        return done(err)  if(err)
        res.body.should.be.have.property('value')
        res.body.value.length.should.be.equal(books.length)
        done()

  it 'should return special resource', (done) ->
    request("http://localhost:#{PORT}")
      .get("/book(#{books[0].id})")
      .expect(200)
      .end (err, res) ->
        return done(err)  if(err)
        res.body.should.be.have.property('title')
        res.body.title.should.be.equal(books[0].title)
        done()

  it 'should be 404 if resouce name not declare', (done) ->
    request("http://localhost:#{PORT}")
      .get("/not-exist-resource")
      .expect(404, done)

  it 'should be 404 if special resource not found', (done) ->
    request("http://localhost:#{PORT}")
      .get("/book(00000)")
      .expect(404, done)
