const bodyParser = require('body-parser');

function multipart(req, res, next) {
  const header = req.headers['content-type'];

  if (!header || header.indexOf('multipart/mixed') === -1) {
    next();
    return;
  }

  const matchesBoundary = header.match(/boundary\s*=\s*([^;]*)/);

  req.body = {
    requests: req.body.split(new RegExp(`\s*--${matchesBoundary[1]}[-]{0,2}\s*`))
      .filter(item => item.trim())
      .map(singleRequestText => {
        const result = {};

        if (singleRequestText.indexOf("Group ID: ") >= 0) {
          return; //sap extension, not documentet in odata
        }
        const matchMethodUrl = singleRequestText.match(/^(GET|POST|PUT|PATCH|DELETE)\s+([\w\/\.$-]+)\s*/m);

        if (!matchMethodUrl) {
          throw new Error(`Method in ${singleRequestText} not supported`);
        }

        result.method = matchMethodUrl[1].toLowerCase();
        result.url = matchMethodUrl[2];

        const matchHeaders = singleRequestText.match(/^^([\w-]+)\s*:\s*([\w.-\/-]+)\s*$/gmi);

        result.headers = {
        };
        matchHeaders.forEach((value) => {
          const parts = value.split(':');

          result.headers[parts[0].trim()] = parts[1].trim();
        });

        const blocks = singleRequestText.split('\n\n');
        if (blocks.length > 2) {
          result.body = JSON.parse(blocks[2]);
        }

        return result;
      }).filter(item => item)
  };

  next();
}

export default [bodyParser.text({type: 'multipart/mixed'}), multipart];