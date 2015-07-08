should = require('should')
request = require('supertest')
odata = require('../.')
support = require('./support')

bookSchema =
  title: String

conn = 'mongodb://localhost/odata-test'
books = undefined

describe 'options.prefix', ->
  it 'should be 200 when use SET', (done) ->
    PORT = 0
    server = odata(conn)
    server.set 'prefix', '/api'
    server.resource 'book', bookSchema
    s = server.listen PORT, ->
      PORT = s.address().port
      request("http://localhost:#{PORT}")
        .get("/api/book")
        .expect(200, done)

  it 'should be 200 when do not add `/`', (done) ->
    PORT = 0
    server = odata(conn)
    server.set 'prefix', 'api'
    server.resource 'book', bookSchema
    s = server.listen PORT, ->
      PORT = s.address().port
      request("http://localhost:#{PORT}")
        .get("/api/book")
        .expect(200, done)

  it 'should be 200 when set it at init function', (done) ->
    PORT = 0
    server = odata(conn, '/api')
    server.resource 'book', bookSchema
    s = server.listen PORT, ->
      PORT = s.address().port
      request("http://localhost:#{PORT}")
        .get("/api/book")
        .expect(200, done)
