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

describe 'odata.actions', ->
  app = undefined
  books = undefined

  before (done) ->
    conn = 'mongodb://localhost/odata-test'
    server = odata(conn)
    server.register
      url: 'book'
      model: bookSchema
      actions:
        '/50off': (req, res, next) ->
          server.repository('book').findById req.params.id, (err, book) ->
            book.price = +(book.price / 2).toFixed(2)
            book.save (err) ->
              res.jsonp(book)
    app = server._app
    support conn, (data) ->
      books = data
      done()

  it 'should work', (done) ->
    request(app)
      .post("/book/#{books[0].id}/50off")
      .expect(200)
      .end (err, res) ->
        return done(err)  if(err)
        halfPrice = +((books[0].price/2).toFixed(2))
        res.body.price.should.be.equal(halfPrice)
        done()

