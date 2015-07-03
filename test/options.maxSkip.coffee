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
        .get("/book?$skip=2")
        .end (err, res) ->
          return done(err)  if(err)
          res.body.value.length.should.be.equal(books.length - 1)
          done()

  describe 'global-limit and query-limit', ->
    it 'should use global-limit if it is minimum', (done) ->
      server = odata(conn)
      server.set 'maxSkip', 1
      server.register
        url: 'book'
        model: bookSchema
      app = server._app
      support conn, (books) ->
        request(app)
          .get("/book?$skip=2")
          .end (err, res) ->
            return done(err)  if(err)
            res.body.value.length.should.be.equal(books.length - 1)
            done()
    it 'should use query-limit if it is minimum', (done) ->
      server = odata(conn)
      server.set 'maxSkip', 2
      server.register
        url: 'book'
        model: bookSchema
      app = server._app
      support conn, (books) ->
        request(app)
          .get("/book?$skip=1")
          .end (err, res) ->
            return done(err)  if(err)
            res.body.value.length.should.be.equal(books.length - 1)
            done()

  describe 'query-limit and resource-limit', ->
    it 'should use global-limit if it is minimum', (done) ->
      server = odata(conn)
      server.register
        url: 'book'
        model: bookSchema
        options:
          maxSkip: 1
      app = server._app
      support conn, (books) ->
        request(app)
          .get("/book?$skip=2")
          .end (err, res) ->
            return done(err)  if(err)
            res.body.value.length.should.be.equal(books.length - 1)
            done()
    it 'should use query-limit if it is minimum', (done) ->
      server = odata(conn)
      server.register
        url: 'book'
        model: bookSchema
        options:
          maxSkip: 2
      app = server._app
      support conn, (books) ->
        request(app)
          .get("/book?$skip=1")
          .end (err, res) ->
            return done(err)  if(err)
            res.body.value.length.should.be.equal(books.length - 1)
            done()

