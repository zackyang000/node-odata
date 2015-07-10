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

describe 'rest.delete', ->
  before (done) ->
    conn = 'mongodb://localhost/odata-test'
    server = odata(conn)
    server.resource 'book', bookSchema
    support conn, (data) ->
      books = data
      s = server.listen PORT, ->
        PORT = s.address().port
        done()

  it 'should delete resource if it exist', (done) ->
    request("http://localhost:#{PORT}")
      .del("/book(#{books[0].id})")
      .expect(200, done)

  it 'should be 404 if resource not exist', (done) ->
    request("http://localhost:#{PORT}")
      .del("/book(00000)")
      .expect(404, done)

  it 'should be 404 if without id', (done) ->
    request("http://localhost:#{PORT}")
      .del("/book")
      .expect(404, done)

  it 'should 404 if try to delete a resource twice', (done) ->
    request("http://localhost:#{PORT}")
      .del("/book/#{books[1].id}")
      .end (err, res) ->
        request("http://localhost:#{PORT}")
          .del("/odata(book/#{books[1].id})")
          .expect(404, done)
