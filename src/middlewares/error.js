import http from 'http';
import Console from '../writer/Console';

export default function(err, req, res, next) {
  const status = err.status || 500;
  const result = {
    error: {
      code: status.toString()
    }
  };
  
  if (status < 500) {
    result.error.message = err.message || http.STATUS_CODES[status];
    result.error.target = err.target;
    result.error.details = err.details;  

  } else {
    const cons = new Console();

    result.error.message = http.STATUS_CODES[status];
    cons.log(err);

  }
  res.status(+status).jsonp(result);
}