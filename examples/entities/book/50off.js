module.exports = function(req, res, next){
  req.$odata.mongo.Books.findById(req.$odata.$Key.id, function(err, book){
    book.price = +(book.price / 2).toFixed(2);
    book.save(function(err){
      res.$odata.result = book.toObject();
      res.$odata.status = 200;
      next();
    });
  });
};