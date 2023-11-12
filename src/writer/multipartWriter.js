export default class MultipartWriter {
  write(res, result, status, httpVersion) {
    const boundary = 'batch_1';
    let body = '';

    result.responses.forEach(response => {
      body += `--${boundary}\r\nContent-Type: application/http\r\n\r\nHTTP/${httpVersion} ${response.status} ${response.statusText}\r\n`;
      if (response.headers) {
        const headers = Object.keys(response.headers);

        headers.forEach(header => {
          body += `${header}: ${response.headers[header]}\r\n`
        });
      }
      body += '\r\n';

      let textBody;
      switch (typeof response.body) {
        case 'string':
          textBody = response.body;
          break;

        case 'undefined': // http status 204
          textBody = '{}';
          break;

        default:
          textBody = JSON.stringify(response.body);
          break;
      }

      body += `${textBody}\r\n`;
    });

    body += `--${boundary}--`;

    res.setHeader('content-type', `multipart/mixed;boundary=${boundary}`);
    res.send(Buffer.from(body)).status(status);
  }
}