export default (req, res, next) => {
  req.$odata.Model.findOne({ id: req.params.id }, (err, entity) => {
    if (err) {
      next(err);
    } else {
      req.$odata.Model.update({ id: req.params.id }, { ...entity, ...req.body }, (err1) => {
        if (err1) {
          next(err1);
        } else {
          res.$odata.result = { ...entity.toObject(), ...req.body };
          next();
        }
      });
    }
  });
};
