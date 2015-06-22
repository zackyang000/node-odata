should = require('should')
request = require('supertest')
odata = require('../.')
support = require('./support')

bookSchema =
  title: String

conn = 'mongodb://localhost/odata-test'

describe 'options.maxSkip', ->
  it 'should work', (done) ->
    server = odata(conn)
    server.set 'maxSkip', 1
    server.register
      url: 'book'
      model: bookSchema
    app = server._app
    support conn, (books) ->
      request(app)
        .get("/odata/book?$skip=10")
        .end (err, res) ->
          return done(err)  if(err)
          res.body.value.length.should.be.equal(books.length - 1)
          done()

  it 'should use global-limit if it is minimum between global-limit and query-limit', (done) ->
    server = odata(conn)
    server.set 'maxSkip', 2
    server.register
      url: 'book'
      model: bookSchema
    app = server._app
    support conn, (books) ->
      request(app)
        .get("/odata/book?$skip=3")
        .end (err, res) ->
          return done(err)  if(err)
          res.body.value.length.should.be.equal(books.length - 2)
          done()

  it 'should use query-limit if it is minimum between global-limit and query-limit', (done) ->
    server = odata(conn)
    server.set 'maxSkip', 4
    server.register
      url: 'book'
      model: bookSchema
    app = server._app
    support conn, (books) ->
      request(app)
        .get("/odata/book?$skip=3")
        .end (err, res) ->
          return done(err)  if(err)
          res.body.value.length.should.be.equal(books.length - 3)
          done()

  #TODO: check correctness between global-limit, resource-limit and query-limit.
