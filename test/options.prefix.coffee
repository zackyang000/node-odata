should = require('should')
request = require('supertest')
odata = require('../.')
support = require('./support')

bookSchema =
  title: String

conn = 'mongodb://localhost/odata-test'

describe 'options.prefix', ->
  app = undefined
  books = undefined

  it 'should be 200 when use SET', (done) ->
    server = odata(conn)
    server.set 'prefix', '/api'
    server.register
      url: 'book'
      model: bookSchema
    app = server._app
    request(app)
      .get("/api/book")
      .expect(200, done)

  it 'should be 200 when do not add `/`', (done) ->
    server = odata(conn)
    server.set 'prefix', 'api'
    server.register
      url: 'book'
      model: bookSchema
    app = server._app
    request(app)
      .get("/api/book")
      .expect(200, done)


  it 'should be 200 when set it at init function', (done) ->
    server = odata(conn, '/api')
    server.register
      url: 'book'
      model: bookSchema
    app = server._app
    request(app)
      .get("/api/book")
      .expect(200, done)
