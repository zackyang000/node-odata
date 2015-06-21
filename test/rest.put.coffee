should = require('should')
request = require('supertest')
uuid = require('node-uuid')
odata = require('../.')
support = require('./support')

bookSchema =
  author: String
  description: String
  genre: String
  price: Number
  publish_date: Date
  title: String

describe 'rest.put', ->
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

  it 'should modify resource', (done) ->
    books[0].title = 'modify title'
    request(app)
      .put("/odata/book/#{books[0].id}")
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
    request(app)
      .put("/odata/book/#{id}")
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
    request(app)
      .put("/odata/book")
      .send(books[0])
      .expect(404, done)

  it "should 400 if with a wrong id", (done) ->
    request(app)
      .put("/odata/book/wrong-id")
      .send(books[0])
      .expect(400, done)
