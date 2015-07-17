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

describe 'hook.delete.before', ->
  it 'should work', (done) ->
    PORT = 0
    server = odata(conn)
    server.resource 'book', bookSchema
      .delete()
        .before (entity) ->
          done()
    support conn, (books) ->
      s = server.listen PORT, ->
        PORT = s.address().port
        request("http://localhost:#{PORT}")
          .del("/book(#{books[0].id})")
          .end()

  it 'should work with multiple hooks', (done) ->
    PORT = 0
    doneTwice = -> doneTwice = done
    server = odata(conn)
    server.resource 'book', bookSchema
      .delete()
        .before (entity) ->
          doneTwice()
        .before (entity) ->
          doneTwice()
    support conn, (books) ->
      s = server.listen PORT, ->
        PORT = s.address().port
        request("http://localhost:#{PORT}")
          .del("/book(#{books[0].id})")
          .end()

