should = require('should')
request = require('supertest')
odata = require('../../.')
support = require('../support')

conn = 'mongodb://localhost/odata-test'

bookSchema =
  author: String
  description: String
  genre: String
  price: Number
  publish_date: Date
  title: String

describe 'hook.put.before', ->
  it 'should work', (done) ->
    PORT = 0
    server = odata(conn)
    server.resource 'book', bookSchema
      .put()
        .before (entity) ->
          entity.should.be.have.property('title')
          done()
    support conn, (books) ->
      s = server.listen PORT, ->
        PORT = s.address().port
        request("http://localhost:#{PORT}")
          .put("/book(#{books[0].id})")
          .send
            title: 'new'
          .end()

  it 'should work with multiple hooks', (done) ->
    PORT = 0
    doneTwice = -> doneTwice = done
    server = odata(conn)
    server.resource 'book', bookSchema
      .put()
        .before () -> doneTwice()
        .before () -> doneTwice()
    support conn, (books) ->
      s = server.listen PORT, ->
        PORT = s.address().port
        request("http://localhost:#{PORT}")
          .put("/book(#{books[0].id})")
          .send
            title: 'new'
          .end()

  it 'should save custom modify', (done) ->
    PORT = 0
    server = odata(conn)
    server.resource 'book', bookSchema
      .put()
        .before (entity) ->
          entity.title += 'custom'
    support conn, (books) ->
      s = server.listen PORT, ->
        PORT = s.address().port
        request("http://localhost:#{PORT}")
          .put("/book(#{books[0].id})")
          .send
            title: 'new'
          .end ->
            request("http://localhost:#{PORT}")
              .get("/book(#{books[0].id})")
              .end (err, res) ->
                res.body.title.should.be.equal('new' + 'custom')
                done()
