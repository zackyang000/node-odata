import selectParser from "../parser/selectParser";

export default async (req, res, next) => {
  try {
    const query = req.$odata.Model.findOne();
  
    await selectParser(query, req.$odata.$select);
  
    let entity = await query.exec();
    let transient = false;

    if (!entity) {
      // return default properties of singleton
      entity = new req.$odata.Model();
      transient = true;
    }

    res.$odata.result = entity.toObject();
    if (transient) {
      res.$odata.result._id = null;
    }

    if (req.$odata.$select) {
      Object.keys(res.$odata.result)
        .forEach(item => {
          if (req.$odata.$select.indexOf(item) === -1) {
            delete res.$odata.result[item];
          }
        });
    }
    next();

  } catch(err) {
    next(err);
  }

};
