const mongoose = require('mongoose');

require('./models/book');
require('./models/complex-resource');
require('./models/user');

module.exports = mongoose.connect(process.env.DATABASE || 'mongodb://localhost:27017/odata-test', null, (err) => {
  if (err) {
    console.error(err.message);
    console.error('Failed to connect to database on startup.');
    process.exit();
  }
});

// provide a event listener to handle not able to connect DB.
// events
mongoose.connection.on('connected', function () {
  console.log('MongoDB connected!');
});
mongoose.connection.on('disconnected', function () {
  console.log('MongoDB disconnected!');
});