import error from '../../middlewares/error';

export default function(err, req, res, next) {
  let mappedError = err;

  if (err.name === 'ValidationError') {
    const details = Object.keys(err.errors).map(name => {
      return {
        code: '400',
        target: name,
        message: err.errors[name].message,
        '@com.sap.vocabularies.Common.v1.numericSeverity': 4
      };
    });
    mappedError = new Error(details[0].message);
    mappedError.target = details[0].target;
    mappedError.status = '400';
    if (details.lenght > 1) {
      mappedError.details = details.slice(1);
    }
  }

  error(mappedError, req, res, next);
}