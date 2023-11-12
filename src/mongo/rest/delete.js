export default async (req, res, next) => {
  try {
    if (req.$odata.clientField) {
      const entity = await req.$odata.Model.findById(req.$odata.$Key._id);

      if (!entity || entity[req.$odata.clientField] !== req.$odata.client) {
        const error = new Error('Not Found');

        error.status = 404;
        throw error;
      }

      await entity.deleteOne();

    } else {
      const result = await req.$odata.Model.deleteOne({ _id: req.$odata.$Key._id });
  
      if (JSON.parse(result).n === 0) {
        const error = new Error('Not Found');
  
        error.status = 404;
        throw error;
      }

    }

    res.$odata.status = 204;
    next();

  } catch(err) {
    next(err);
  }

};
