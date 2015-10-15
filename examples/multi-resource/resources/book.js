var Resource = require('../../../').Resource;

module.exports = Resource('book', {
  author: String,
  description: String,
  genre: String,
  price: Number,
  publish_date: Date,
  title: String
});
