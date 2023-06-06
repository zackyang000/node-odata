import http from 'http';
import Console from '../writer/Console';

export default function(err, req, res, next) {
  const status = err.status || 500;
  const result = {
    error: {
      code: status.toString(),
      message: status < 500 ? err.message || http.STATUS_CODES[status] : http.STATUS_CODES[status]    
    }
  
  };
  if (status >= 500) {
    const cons = new Console();

    cons.log(err);
  }
  res.status(status).jsonp(result);
}