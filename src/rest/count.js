export default async (req, MongooseModel, options) => {
  return new Promise((resolve, reject) => {
    const query = MongooseModel.find();

    query.count((err, count) => {
      if (err) {
        const result = new Error(err.message);
    
        result.previous = err;
        result.status = 500;
        reject(result);

      } else {
        resolve({
          result: count.toString(),
          status: 200,
          supportedMimetypes: ['text/plain']
        });

      }
    });
  });
};
