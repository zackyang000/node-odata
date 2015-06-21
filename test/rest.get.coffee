should = require('should')
request = require('supertest')
odata = require('../.')
support = require('./support')

bookSchema =
  author: String
  description: String
  genre: String
  price: Number
  publish_date: Date
  title: String

describe 'rest.get', ->
  app = undefined
  books = undefined

  before (done) ->
    conn = 'mongodb://localhost/odata-test'
    server = odata(conn)
    server.register
      url: 'book'
      model: bookSchema
    app = server._app
    support conn, (data) ->
      books = data
      done()

  it 'should return all of the resources', (done) ->
    request(app)
      .get('/odata/book')
      .expect(200)
      .end (err, res) ->
        return done(err)  if(err)
        res.body.should.be.have.property('value')
        res.body.value.length.should.be.equal(books.length)
        done()

  it 'should return special resource', (done) ->
    request(app)
      .get("/odata/book/#{books[0].id}")
      .expect(200)
      .end (err, res) ->
        return done(err)  if(err)
        res.body.should.be.have.property('title')
        res.body.title.should.be.equal(books[0].title)
        done()

  it 'should be 404 if resouce name not declare', (done) ->
    request(app)
      .get("/odata/not-exist-resource")
      .expect(404, done)

  it 'should be 404 if special resource not found', (done) ->
    request(app)
      .get("/odata/book/00000")
      .expect(404, done)
