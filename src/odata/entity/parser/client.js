import parseValue from '../../parser/value';

module.exports = function parseClient(req, name, metadata, target) {
  if (req.query['sap-client']) {
    return parseValue(req.query['sap-client'], metadata[target]);

  } else if (target) {
    const err = new Error(`For entity '${name}' you must send a client value`);

    err.status = 400;
    throw err;

  }
}