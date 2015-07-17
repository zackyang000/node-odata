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

describe 'hook.put.after', ->
  it 'should work', (done) ->
    PORT = 0
    server = odata(conn)
    server.resource 'book', bookSchema
      .put()
        .after (newEntity, oldEntity) ->
          newEntity.should.be.have.property('title')
          oldEntity.should.be.have.property('title')
          newEntity.title.should.not.be.equal(oldEntity.title)
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
        .after () -> doneTwice()
        .after () -> doneTwice()
    support conn, (books) ->
      s = server.listen PORT, ->
        PORT = s.address().port
        request("http://localhost:#{PORT}")
          .put("/book(#{books[0].id})")
          .send
            title: 'new'
          .end()
