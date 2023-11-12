export default async (req, res, next) => {
  try {
    const filter = req.$odata.clientField && req.$odata.client ? { // special client filter
      [req.$odata.clientField]: req.$odata.client
    } : undefined;
    const query = req.$odata.Model.find(filter);
    const count = await query.count();

    res.$odata.result = count.toString();
    res.$odata.supportedMimetypes = ['text/plain'];

    next();

  } catch(err) {
    next(err);
  }

};
