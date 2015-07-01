### TODO: unknow error: if run this tester, rest.put before all will failed.
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

describe 'rest.put.before', ->
  it 'should work', (done) ->
    conn = 'mongodb://localhost/odata-test'
    server = odata(conn)
    server.register
      url: 'book'
      model: bookSchema
      rest:
        put:
          before: (entity) ->
            entity.should.be.have.property('title')
            done()
    app = server._app
    support conn, (data) ->
      books = data
      request(app)
        .put("/odata/book/#{books[0].id}")
        .send
          title: 'new'
        .end()
###
