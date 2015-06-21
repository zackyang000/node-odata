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

describe 'rest.delete', ->
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

  it 'should delete resource if it exist', (done) ->
    request(app)
      .del("/odata/book/#{books[0].id}")
      .expect(200, done)

  it 'should be 404 if resource not exist', (done) ->
    request(app)
      .del("/odata/book/00000")
      .expect(404, done)

  it 'should be 404 if without id', (done) ->
    request(app)
      .del("/odata/book")
      .expect(404, done)

  it 'should 404 if try to delete a resource twice', (done) ->
    request(app)
      .del("/odata/book/#{books[1].id}")
      .end (err, res) ->
        request(app)
          .del("/odata/book/#{books[1].id}")
          .expect(404, done)
