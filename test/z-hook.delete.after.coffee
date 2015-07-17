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

describe 'hook.delete.after', ->
  it 'should work', (done) ->
    PORT = 0
    conn = 'mongodb://localhost/odata-test'
    server = odata(conn)
    server.resource 'book', bookSchema
      .delete()
        .after (entity) ->
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
    conn = 'mongodb://localhost/odata-test'
    server = odata(conn)
    server.resource 'book', bookSchema
      .delete()
        .after (entity) ->
          doneTwice()
        .after (entity) ->
          doneTwice()
    support conn, (books) ->
      s = server.listen PORT, ->
        PORT = s.address().port
        request("http://localhost:#{PORT}")
          .del("/book(#{books[0].id})")
          .end()

