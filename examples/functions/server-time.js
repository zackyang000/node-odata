module.exports = function(req, res, next) {
  res.$odata.result = { date: new Date() };
  res.$odata.status = 200;
  next();
};


