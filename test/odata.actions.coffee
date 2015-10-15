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

books = undefined

describe 'odata.actions', ->
  before (done) ->
    conn = 'mongodb://localhost/odata-test'
    server = odata(conn)
    server.resource 'book', bookSchema
      .action '/50off', (req, res, next) ->
        server.resources.book.findById req.params.id, (err, book) ->
          book.price = +(book.price / 2).toFixed(2)
          book.save (err) ->
            res.jsonp(book)
    support conn, (data) ->
      books = data
      s = server.listen PORT, ->
        PORT = s.address().port
        done()

  it 'should work', (done) ->
    request("http://localhost:#{PORT}")
      .post("/book(#{books[0].id})/50off")
      .expect(200)
      .end (err, res) ->
        return done(err)  if(err)
        halfPrice = +((books[0].price/2).toFixed(2))
        res.body.price.should.be.equal(halfPrice)
        done()

