var fixtures = require("pow-mongoose-fixtures");

var server = require('../basic/');

//import data.
data = require("../../test/support/data.json");
fixtures.load({books: data}, server.mongoose.connection);
