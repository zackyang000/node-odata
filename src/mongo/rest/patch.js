export default async (req, res, next) => {
  try {
    const entity = await req.$odata.Model.findOne({ id: req.params.id });
    const patched = { ...entity.toObject(), ...req.body };

    await req.$odata.Model.update({ id: req.params.id }, patched);
    res.$odata.result = patched;
    next();

  } catch (err) {
    next(err);
  }
}