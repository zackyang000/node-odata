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

describe 'rest.get.before', ->
  it 'should work', (done) ->
    conn = 'mongodb://localhost/odata-test'
    server = odata(conn)
    server.register
      url: 'book'
      model: bookSchema
      rest:
        get:
          before: (entity) ->
            entity.should.be.have.property('title')
            done()
    app = server._app
    support conn, (data) ->
      books = data
      request(app)
        .get("/book/#{books[0].id}")
        .end()

