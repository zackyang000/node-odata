mongoose = require('mongoose')
books = require('./books.json')
id = require('../../lib/model/idPlugin')

bookSchema =
  author: String
  description: String
  genre: String
  price: Number
  publish_date: Date
  title: String

conf =
  _id: false
  versionKey: false
  collection: 'book'

schema = new mongoose.Schema(bookSchema, conf)
schema.plugin(id)

module.exports = (conn, callback) ->
  count = 0
  done = () ->
    count++
    if count is books.length
      model.find().exec (err, data) ->
        callback(data)  if callback

  db = mongoose.createConnection(conn)
  model = db.model('book', schema)
  
  model.remove {}, (err, result) ->
    books.map (item) ->
      entity = new model(item)
      entity.save done
