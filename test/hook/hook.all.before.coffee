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

describe 'hook.all.before', ->
  it 'should work', (done) ->
    PORT = 0
    doneTwice = -> doneTwice = done
    server = odata(conn)
    server.resource 'book', bookSchema
      .all()
        .before () ->
          doneTwice()
    support conn, (books) ->
      s = server.listen PORT, ->
        PORT = s.address().port
        request("http://localhost:#{PORT}")
          .get("/book(#{books[0].id})")
          .end ->
            request("http://localhost:#{PORT}")
              .get("/book")
              .end()

