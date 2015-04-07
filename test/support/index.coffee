odata = require("../../")
fixtures = require("pow-mongoose-fixtures")
callback = undefined
done = undefined

server = odata()
server.set('db', 'mongodb://localhost/odata-test')

mongoose = server.mongoose

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

server.functions.register
    url: '/license',
    method: 'GET',
    handle: (req, res, next) ->
      res.jsonp({license:'MIT'})

#import data.
data = require("./data.json")
fixtures.load books: data, mongoose.connection, (err) ->
  mongoose.model('books').find().exec (err, data) ->
    module.exports.app = server._app
    module.exports.books = data
    done = true
    callback()  if callback

module.exports.ready = (cb) ->
  callback = cb
  callback()  if done
