export default function applyClient(req, entity) {
  if (!req.$odata.clientField) {
    return;
  }

  entity[req.$odata.clientField] = req.$odata.client;
}