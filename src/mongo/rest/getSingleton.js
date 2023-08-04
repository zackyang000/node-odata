import selectParser from "../parser/selectParser";

export default async (req, res, next) => {
  const query = req.$odata.Model.findOne();

  await selectParser(query, req.$odata.$select);

  query.exec((err, entity) => {
    if (err) {
      return next(err);
    }

    if (!entity) {
      // return default properties of singleton
      const result = new req.$odata.Model();

      res.$odata.result = result.toObject();
      if (req.$odata.$select) {
        Object.keys(res.$odata.result)
          .forEach(item => {
            if (req.$odata.$select.indexOf(item) === -1) {
              delete req.$odata.$select;
            }
          });
      }
      return next();
    }

    res.$odata.result = entity.toObject();
    return next();
  });
};
