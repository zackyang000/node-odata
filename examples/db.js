const mongoose = require('mongoose');
const server = require('./server');

server.addBefore(async (req, res, next) => {
  try {
    req.$odata = {
      ...req.$odata,
      mongo: await mongoose.connect(process.env.DATABASE || 'mongodb://localhost:27017/odata-test')
    };

    next();

  } catch(err) {
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