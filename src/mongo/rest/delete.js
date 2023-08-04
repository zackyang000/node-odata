export default async (req, res, next) => {
  try {
    const result = await req.$odata.Model.deleteOne({ _id: req.$odata.$Key._id });

    if (JSON.parse(result).n === 0) {
      const error = new Error('Not Found');

      error.status = 404;
      throw error;
    }

    res.$odata.status = 204;
    next();

  } catch(err) {
    next(err);
  }

};
