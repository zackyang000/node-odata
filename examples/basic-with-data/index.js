var server = require('../basic/');

//import data.
var fixtures = require("pow-mongoose-fixtures");
var data = require("../../test/support/data.json");
fixtures.load({books: data}, server.mongoose.connection);
