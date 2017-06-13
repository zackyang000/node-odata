const mongoose = require('mongoose');

const createConnection = (conn) => {
  // TODO: 这里可能需要单例模式, 否则创建多个链接会报错.
  const options = { server: { reconnectTries: Number.MAX_VALUE } };
  return mongoose.createConnection(conn, options, (err) => {
    if (err) {
      console.error('Failed to connect to database on startup.');
      process.exit();
    }
  });
}

module.exports = createConnection;
