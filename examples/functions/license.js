const server = require('../server');

server.function('license', function(req, res, next) {
  res.$odata.result = { license: 'MIT' };
  res.$odata.status = 200;
  next();
});


