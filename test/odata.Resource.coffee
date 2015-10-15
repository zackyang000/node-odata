should = require('should')
request = require('supertest')
odata = require('../.')
support = require('./support')

PORT = 0

bookSchema =
  author: String
  description: String
  genre: String
  price: Number
  publish_date: Date
  title: String

conn = 'mongodb://localhost/odata-test'

describe 'odata.Resource', ->
  it 'should be work', (done) ->
    book = odata.Resource('book', bookSchema)
    server = odata(conn)
    server.use(book)
    s = server.listen PORT, ->
      PORT = s.address().port
      request("http://localhost:#{PORT}")
        .post("/book")
        .send
          title: 'new'
        .expect(201, done)
