export default (req, MongooseModel) => new Promise((resolve, reject) => {
  if (!Object.keys(req.body).length) {
    const error = new Error();

    error.status = 422;
    reject(error);
  } else {
    const entity = MongooseModel.create(req.body);

    entity.save((err) => {
      if (err) {
        reject(err);
      } else {
        resolve({ 
          status: 201, 
          result: entity 
        });
      }
    });
  }
});
