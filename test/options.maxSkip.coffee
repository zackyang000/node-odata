should = require('should')
request = require('supertest')
odata = require('../.')
support = require('./support')

bookSchema =
  title: String

conn = 'mongodb://localhost/odata-test'

describe 'options.maxSkip', ->

  it 'should work', (done) ->
    PORT = 0
    server = odata(conn)
    server.set 'maxSkip', 1
    server.resource 'book', bookSchema
    support conn, (books) ->
      s = server.listen PORT, ->
        PORT = s.address().port
        request("http://localhost:#{PORT}")
          .get("/book?$skip=2")
          .end (err, res) ->
            return done(err)  if(err)
            res.body.value.length.should.be.equal(books.length - 1)
            done()

  describe 'global-limit and query-limit', ->
    it 'should use global-limit if it is minimum', (done) ->
      PORT = 0
      server = odata(conn)
      server.set 'maxSkip', 1
      server.resource 'book', bookSchema
      support conn, (books) ->
        s = server.listen PORT, ->
          PORT = s.address().port
          request("http://localhost:#{PORT}")
            .get("/book?$skip=2")
            .end (err, res) ->
              return done(err)  if(err)
              res.body.value.length.should.be.equal(books.length - 1)
              done()
    it 'should use query-limit if it is minimum', (done) ->
      PORT = 0
      server = odata(conn)
      server.set 'maxSkip', 2
      server.resource 'book', bookSchema
      support conn, (books) ->
        s = server.listen PORT, ->
          PORT = s.address().port
          request("http://localhost:#{PORT}")
            .get("/book?$skip=1")
            .end (err, res) ->
              return done(err)  if(err)
              res.body.value.length.should.be.equal(books.length - 1)
              done()

  describe 'query-limit and resource-limit', ->
    it 'should use global-limit if it is minimum', (done) ->
      PORT = 0
      server = odata(conn)
      server.resource 'book', bookSchema
        .maxSkip 1
      support conn, (books) ->
        s = server.listen PORT, ->
          PORT = s.address().port
          request("http://localhost:#{PORT}")
            .get("/book?$skip=2")
            .end (err, res) ->
              return done(err)  if(err)
              res.body.value.length.should.be.equal(books.length - 1)
              done()
    it 'should use query-limit if it is minimum', (done) ->
      PORT = 0
      server = odata(conn)
      server.resource 'book', bookSchema
        .maxSkip 2
      support conn, (books) ->
        s = server.listen PORT, ->
          PORT = s.address().port
          request("http://localhost:#{PORT}")
            .get("/book?$skip=1")
            .end (err, res) ->
              return done(err)  if(err)
              res.body.value.length.should.be.equal(books.length - 1)
              done()

