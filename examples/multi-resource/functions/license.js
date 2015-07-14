var func = require('../../../').Function;

var router = func();

router.get('/license', function(req, res, next) {
  res.jsonp({ license: 'MIT' });
});

module.exports = router;

