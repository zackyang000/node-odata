should = require('should')
request = require('supertest')
odata = require('../.')
support = require('./support')

bookSchema =
  title: String

conn = 'mongodb://localhost/odata-test'

describe 'options.odataSyntax', ->
  app = undefined
  books = undefined

  before (done) ->
    server = odata(conn)
    server.set 'enableOdataSyntax', true
    server.register
      url: 'book'
      model: bookSchema
      actions:
        '/50off': (req, res, next) ->
          server.repository('book').findById req.params.id, (err, book) ->
            book.price = +(book.price / 2).toFixed(2)
            book.save (err) ->
              res.jsonp(book)
    app = server._app
    support conn, (data) ->
      books = data
      done()

  it 'should be 200 if it have entity', (done) ->
    request(app)
      .get("/book(#{books[0].id})")
      .expect(200, done)

  it 'should be 404 if it have not entity', (done) ->
    request(app)
      .get("/book(1)")
      .expect(404, done)

  it 'should be 200 when request to action', (done) ->
    request(app)
      .get("/book(#{books[0].id})")
      .expect(200, done)
