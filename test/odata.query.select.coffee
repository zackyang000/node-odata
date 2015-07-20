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

describe 'odata.query.select', ->

  before (done) ->
    conn = 'mongodb://localhost/odata-test'
    server = odata(conn)
    server.resource 'book', bookSchema
    support conn, (data) ->
      books = data
      s = server.listen PORT, ->
        PORT = s.address().port
        done()

  it 'should select anyone field', (done) ->
    request("http://localhost:#{PORT}")
      .get("/book?$select=price")
      .expect(200)
      .end (err, res) ->
        return done(err)  if(err)
        res.body.value[0].should.be.have.property('price')
        res.body.value[0].should.be.not.have.property('title')
        res.body.value[0].should.be.not.have.property('id')
        done()

  it 'should select multiple field', (done) ->
    request("http://localhost:#{PORT}")
      .get("/book?$select=price,title")
      .expect(200)
      .end (err, res) ->
        return done(err)  if(err)
        res.body.value[0].should.be.have.property('price')
        res.body.value[0].should.be.have.property('title')
        res.body.value[0].should.be.not.have.property('id')
        done()

  it 'should select multiple field with blank space', (done) ->
    request("http://localhost:#{PORT}")
      .get("/book?$select=price,   title")
      .expect(200)
      .end (err, res) ->
        return done(err)  if(err)
        res.body.value[0].should.be.have.property('price')
        res.body.value[0].should.be.have.property('title')
        done()

  it 'should select id field', (done) ->
    request("http://localhost:#{PORT}")
      .get("/book?$select=price,title,id")
      .expect(200)
      .end (err, res) ->
        return done(err)  if(err)
        res.body.value[0].should.be.have.property('price')
        res.body.value[0].should.be.have.property('title')
        res.body.value[0].should.be.have.property('id')
        done()

  it 'should ignore when select not exist field', (done) ->
    request("http://localhost:#{PORT}")
      .get("/book?$select=not-exist-field")
      .expect(200, done)
