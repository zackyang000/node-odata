import filterParser from '../parser/filterParser';
import orderbyParser from '../parser/orderbyParser';
import skipParser from '../parser/skipParser';
import topParser from '../parser/topParser';
import selectParser from '../parser/selectParser';

function _dataQuery(model, {
  filter, orderby, skip, top, select,
}) {
  return new Promise((resolve, reject) => {
    const query = model.find(filterParser(filter));
    orderbyParser(query, orderby)
      .then(() => skipParser(query, skip))
      .then(() => topParser(query, top))
      .then(() => selectParser(query, select))
      .then(() => query.exec((err, data) => {
        if (err) {
          return reject(err);
        }
        return resolve({ value: data.map(item => item.toObject()) });
      }))
      .catch(reject);
  });
}

export default (req, res, next) => {
  const params = {
    count: req.$odata.$count,
    filter: req.$odata.$filter,
    orderby: req.$odata.$orderby,
    skip: req.$odata.$skip,
    top: req.$odata.$top,
    select: req.$odata.$select,
    // TODO expand: req.$odata.$expand,
    // TODO search: req.$odata.$search,
  };

  _dataQuery(req.$odata.Model, params).then((result) => {
    res.$odata.result = {
      ...res.$odata.result,
      ...result
    };
    next();
  }).catch(next);
};
