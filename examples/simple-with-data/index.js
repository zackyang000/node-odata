var server = require('../simple/');
var data = require("../../test/support/books.json");

model = server._db.model('book');

model.remove({}, function(err, result) {
  data.map(function(item) {
    entity = new model(item);
    entity.save();
  });
});
