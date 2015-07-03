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

describe 'rest.put.after', ->
  it 'should work', (done) ->
    conn = 'mongodb://localhost/odata-test'
    server = odata(conn)
    server.register
      url: 'book'
      model: bookSchema
      rest:
        put:
          after: (newEntity, oldEntity) ->
            newEntity.should.be.have.property('title')
            oldEntity.should.be.have.property('title')
            newEntity.title.should.not.be.equal(oldEntity.title)
            done()
    app = server._app
    support conn, (data) ->
      books = data
      request(app)
        .put("/book/#{books[0].id}")
        .send
          title: 'new'
        .end()

