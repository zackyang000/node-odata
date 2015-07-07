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

describe 'odata.query.count', ->
  before (done) ->
    conn = 'mongodb://localhost/odata-test'
    server = odata(conn)
    server.resource 'book', bookSchema
    support conn, (data) ->
      books = data
      s = server.listen PORT, ->
        PORT = s.address().port
        done()

  it 'should get count', (done) ->
    request("http://localhost:#{PORT}")
      .get("/book?$count=true")
      .expect(200)
      .end (err, res) ->
        return done(err)  if(err)
        res.body.should.be.have.property('@odata.count')
        res.body.should.be.have.property('value')
        res.body['@odata.count'].should.be.equal(res.body.value.length)
        done()

  it 'should not get count', (done) ->
    request("http://localhost:#{PORT}")
      .get("/book?$count=false")
      .expect(200)
      .end (err, res) ->
        return done(err)  if(err)
        res.body.should.be.not.have.property('@odata.count')
        done()

  it 'should 500 when $count isn\'t \'true\' or \'false\'', (done) ->
    request("http://localhost:#{PORT}")
      .get("/book?$count=1")
      .expect(500, done)
