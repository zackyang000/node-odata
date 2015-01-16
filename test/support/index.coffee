odata = require("../../index")
mongoose = odata.mongoose
fixtures = require("pow-mongoose-fixtures")
callback = undefined
done = undefined


#import data.
data = require("./data.json")
for item in data
  item._id = mongoose.Types.ObjectId()
fixtures.load books: data, mongoose.connection, (err) ->
  module.exports.app = odata._app
  module.exports.books = data
  done = true
  callback()  if callback

module.exports.ready = (cb) ->
  callback = cb
  callback()  if done
