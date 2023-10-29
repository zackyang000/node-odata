import parseValue from '../../parser/value';

module.exports = function parseClient(req, target, metadata) {
  debugger;
  if (req.query['sap-client']) {
    return parseValue(req.query['sap-client'], metadata[target]);
  }
}