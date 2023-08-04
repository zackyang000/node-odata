export default async (req, res, next) => {
  try {
    const query = req.$odata.Model.find();
    const count = await query.count();

    res.$odata.result = count.toString();
    res.$odata.supportedMimetypes = ['text/plain'];

    next();

  } catch(err) {
    next(err);
  }

};
