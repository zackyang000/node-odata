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

describe 'rest.get.before', ->
  it 'should work', (done) ->
    conn = 'mongodb://localhost/odata-test'
    server = odata(conn)
    server.resource 'book', bookSchema
      .get()
        .before (entity) ->
          entity.should.be.have.property('title')
          done()
    support conn, (books) ->
      s = server.listen PORT, ->
        PORT = s.address().port
        request("http://localhost:#{PORT}")
          .get("/book(#{books[0].id})")
          .end()

