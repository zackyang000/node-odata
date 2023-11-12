import filterParser from '../parser/filterParser';
import skipParser from '../parser/skipParser';
import topParser from '../parser/topParser';
import selectParser from '../parser/selectParser';

export default async (req, res, next) => {

  try {
    // TODO expand: req.$odata.$expand,
    // TODO search: req.$odata.$search,
    const filter = filterParser(req.$odata.$filter, req.$odata);
    const query = req.$odata.Model.find(filter);

    if (req.$odata.$orderby) {
      query.sort(req.$odata.$orderby);
    }
  
    await skipParser(query, req.$odata.$skip);
    await topParser(query, req.$odata.$top);
    await selectParser(query, req.$odata.$select);
  
    const data = await query.exec();
    const result = { value: data.map(item => item.toObject()) };

    res.$odata.result = {
      ...res.$odata.result,
      ...result
    };

    next();

  } catch (err) {
    next(err);
  }

};
