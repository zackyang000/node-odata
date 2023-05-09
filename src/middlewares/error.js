import http from 'http';

export default function(err, req, res, next) {
  debugger;
  const status = err.status || 500;
  const text = err.text || err.message || http.STATUS_CODES[status];
  res.status(status).send(text);
}