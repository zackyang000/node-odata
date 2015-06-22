should = require('should')
request = require('supertest')
odata = require('../.')
support = require('./support')

bookSchema =
  title: String

conn = 'mongodb://localhost/odata-test'

describe 'options.maxTop', ->
  it 'should work', (done) ->
    server = odata(conn)
    server.set 'maxTop', 1
    server.register
      url: 'book'
      model: bookSchema
    app = server._app
    support conn, (books) ->
      request(app)
        .get("/odata/book?$top=10")
        .end (err, res) ->
          return done(err)  if(err)
          res.body.value.length.should.be.equal(1)
          done()

  it 'should use global-limit if it is minimum between global-limit and query-limit', (done) ->
    server = odata(conn)
    server.set 'maxTop', 2
    server.register
      url: 'book'
      model: bookSchema
    app = server._app
    support conn, (books) ->
      request(app)
        .get("/odata/book?$top=3")
        .end (err, res) ->
          return done(err)  if(err)
          res.body.value.length.should.be.equal(2)
          done()

  it 'should use query-limit if it is minimum between global-limit and query-limit', (done) ->
    conn = 'mongodb://localhost/odata-test'
    server = odata(conn)
    server.set 'maxTop', 4
    server.register
      url: 'book'
      model: bookSchema
    app = server._app
    support conn, (books) ->
      request(app)
        .get("/odata/book?$top=3")
        .end (err, res) ->
          return done(err)  if(err)
          res.body.value.length.should.be.equal(3)
          done()

  #todo: check correctness between global-limit, resource-limit and query-limit.
