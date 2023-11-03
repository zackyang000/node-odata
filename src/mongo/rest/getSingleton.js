import selectParser from "../parser/selectParser";

export default async (req, res, next) => {
  try {
    debugger;
    const param = req.$odata.clientField ? { [req.$odata.clientField]: req.$odata.client } : undefined;
    const query = req.$odata.Model.findOne(param);
  
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
      if (req.$odata.clientField) {
        res.$odata.result[req.$odata.clientField] = req.$odata.client;
      }
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
