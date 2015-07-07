should = require('should')
request = require('supertest')
odata = require('../.')
support = require('./support')

PORT = 0

bookSchema =
  title: String

conn = 'mongodb://localhost/odata-test'
books = undefined

describe 'options.odataSyntax', ->
  before (done) ->
    server = odata(conn)
    server.set 'enableOdataSyntax', true
    server.resource 'book', bookSchema
      .action '/50off', (req, res, next) ->
        server.repository('book').findById req.params.id, (err, book) ->
          book.price = +(book.price / 2).toFixed(2)
          book.save (err) ->
            res.jsonp(book)
    support conn, (data) ->
      books = data
      s = server.listen PORT, ->
        PORT = s.address().port
        done()

  it 'should be 200 if it have entity', (done) ->
    request("http://localhost:#{PORT}")
      .get("/book(#{books[0].id})")
      .expect(200, done)

  it 'should be 404 if it have not entity', (done) ->
    request("http://localhost:#{PORT}")
      .get("/book(1)")
      .expect(404, done)

  it 'should be 200 when request to action', (done) ->
    request("http://localhost:#{PORT}")
      .get("/book(#{books[0].id})")
      .expect(200, done)
