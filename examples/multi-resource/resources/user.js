var Resource = require('../../../').Resource;

module.exports = Resource('user', {
  name: String,
  password: {
    type: String,
    select: false
  }
});
