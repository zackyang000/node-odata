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

describe 'odata.query.count', ->
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

  it 'should get count', (done) ->
    request(app)
      .get("/book?$count=true")
      .expect(200)
      .end (err, res) ->
        return done(err)  if(err)
        res.body.should.be.have.property('@odata.count')
        res.body.should.be.have.property('value')
        res.body['@odata.count'].should.be.equal(res.body.value.length)
        done()

  it 'should not get count', (done) ->
    request(app)
      .get("/book?$count=false")
      .expect(200)
      .end (err, res) ->
        return done(err)  if(err)
        res.body.should.be.not.have.property('@odata.count')
        done()

  it 'should 500 when $count isn\'t \'true\' or \'false\'', (done) ->
    request(app)
      .get("/book?$count=1")
      .expect(500, done)
