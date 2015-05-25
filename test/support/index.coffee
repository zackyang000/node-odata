odata = require("../../")
fixtures = require("pow-mongoose-fixtures")
data = require("./data.json")
callback = undefined
done = undefined

server = odata('mongodb://localhost/odata-test')

mongoose = server._mongoose

bookInfo = {
  author: String,
  description: String,
  genre: String,
  price: Number,
  publish_date: Date,
  title: String
}

server.resources.register
  url: '/books'
  model: bookInfo
  actions:
    '/50off': (req, res, next) ->
      mongoose.model('books').findById req.params.id, (err, book) ->
        book.price = +(book.price / 2).toFixed(2)
        book.save (err) ->
          res.jsonp(book)

server.get '/license', (req, res, next) ->
    res.jsonp({license:'MIT'})

#import data.
load = (callback) ->
  fixtures.load books: data, mongoose.connection, (err) ->
    mongoose.model('books').find().exec (err, data) ->
      module.exports.server = server
      module.exports.app = server._app
      module.exports.books = data
      callback()  if callback

module.exports.ready = load
