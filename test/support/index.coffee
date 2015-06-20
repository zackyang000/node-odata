odata = require("../../")
fixtures = require("pow-mongoose-fixtures")
data = require("./data.json")
callback = undefined
done = undefined

conn = 'mongodb://localhost/odata-test'
server = odata(conn)

mongoose = server._mongoose
db = server._db

bookInfo =
  author: String
  description: String
  genre: String
  price: Number
  publish_date: Date
  title: String

server.register
  url: 'books'
  model: bookInfo
  actions:
    '/50off': (req, res, next) ->
      server.repository('books').findById req.params.id, (err, book) ->
        book.price = +(book.price / 2).toFixed(2)
        book.save (err) ->
          res.jsonp(book)

server.get '/license', (req, res, next) ->
    res.jsonp({license:'MIT'})

#import data.
load = (callback) ->
  # TODO: 修改为使用 mongoDB 直接存储, 因为 fixtures 不支持这个功能.
  #fixtures.load books: data, mongoose.connection, (err) ->
    db.model('books').find().exec (err, data) ->
      module.exports.server = server
      module.exports.app = server._app
      module.exports.books = data
      callback()  if callback

module.exports.ready = load
