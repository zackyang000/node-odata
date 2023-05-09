export default class {
  writeJson(res, data, status) {
    let normalizedData = data;

    if (data.toObject) {
      normalizedData = data.toObject();
    }

    res.type('application/json');
    res.status(status).jsonp(normalizedData);
  }

}
