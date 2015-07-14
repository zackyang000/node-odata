var func = require('../../../').Function;

var router = func();

router.get('/server-time', function(req, res, next) {
  res.jsonp({ date: new Date() });
});

module.exports = router;


