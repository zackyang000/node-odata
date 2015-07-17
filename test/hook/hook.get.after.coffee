should = require('should')
request = require('supertest')
odata = require('../../.')
support = require('../support')

conn = 'mongodb://localhost/odata-test'

bookSchema =
  author: String
  description: String
  genre: String
  price: Number
  publish_date: Date
  title: String

describe 'hook.get.after', ->
  it 'should work', (done) ->
    PORT = 0
    server = odata(conn)
    server.resource 'book', bookSchema
      .get()
        .after (entity) ->
          entity.should.be.have.property('title')
          done()
    support conn, (books) ->
      s = server.listen PORT, ->
        PORT = s.address().port
        request("http://localhost:#{PORT}")
          .get("/book(#{books[0].id})")
          .end()

  it 'should work with multiple hooks', (done) ->
    PORT = 0
    doneTwice = -> doneTwice = done
    server = odata(conn)
    server.resource 'book', bookSchema
      .get()
        .after (entity) ->
          doneTwice()
        .after (entity) ->
          doneTwice()
    support conn, (books) ->
      s = server.listen PORT, ->
        PORT = s.address().port
        request("http://localhost:#{PORT}")
          .get("/book(#{books[0].id})")
          .end()

