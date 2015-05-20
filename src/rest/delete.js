module.exports = function(req, mongooseModel) {
  return new Promise(function(resolve, reject) {
    mongooseModel.remove({_id: req.params.id}, function(err, result) {
      if(err) {
        return reject(err);
      }

      if(JSON.parse(result).n === 0) {
        return reject({status: 404}, {text: 'Not Found'});
      }

      return resolve();
    });
  });
}
