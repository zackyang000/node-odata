odata = require("../../")
mongoose = odata.mongoose
uuid = require 'node-uuid'
fixtures = require("pow-mongoose-fixtures")
callback = undefined
done = undefined


#import data.
data = require("./data.json")
fixtures.load books: data, mongoose.connection, (err) ->
  mongoose.model('books').find().exec (err, data) ->
    module.exports.app = odata._app
    module.exports.books = data
    done = true
    callback()  if callback

module.exports.ready = (cb) ->
  callback = cb
  callback()  if done
