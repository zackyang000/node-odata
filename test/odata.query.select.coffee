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

describe 'odata.query.select', ->
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

  it 'should select anyone field', (done) ->
    request(app)
      .get("/book?$select=price")
      .expect(200)
      .end (err, res) ->
        return done(err)  if(err)
        res.body.value[0].should.be.have.property('price')
        res.body.value[0].should.be.not.have.property('title')
        res.body.value[0].should.be.not.have.property('id')
        done()

  it 'should select multiple field', (done) ->
    request(app)
      .get("/book?$select=price,title")
      .expect(200)
      .end (err, res) ->
        return done(err)  if(err)
        res.body.value[0].should.be.have.property('price')
        res.body.value[0].should.be.have.property('title')
        res.body.value[0].should.be.not.have.property('id')
        done()

  it 'should select multiple field with blank space', (done) ->
    request(app)
      .get("/book?$select=price,   title")
      .expect(200)
      .end (err, res) ->
        return done(err)  if(err)
        res.body.value[0].should.be.have.property('price')
        res.body.value[0].should.be.have.property('title')
        res.body.value[0].should.be.not.have.property('id')
        done()

  it 'should select id field', (done) ->
    request(app)
      .get("/book?$select=price,title,id")
      .expect(200)
      .end (err, res) ->
        return done(err)  if(err)
        res.body.value[0].should.be.have.property('price')
        res.body.value[0].should.be.have.property('title')
        res.body.value[0].should.be.have.property('id')
        done()

  it 'should ignore when select not exist field', (done) ->
    request(app)
      .get("/book?$select=not-exist-field")
      .expect(200, done)
