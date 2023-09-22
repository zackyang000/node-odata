export default async (req, res, next) => {
  try {
    const entity = await req.$odata.Model.findOne({ id: req.$odata.$Key.id });
    const patched = { ...entity.toObject(), ...req.$odata.body };

    await req.$odata.Model.updateOne({ _id: req.$odata.$Key.id }, patched);
    res.$odata.result = patched;
    next();

  } catch (err) {
    next(err);
  }
}