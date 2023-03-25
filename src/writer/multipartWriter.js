export default class MultipartWriter {
  write(res, result, status, resolve, httpVersion) {
    const boundary = 'batch_1';
    let body = '';

    result.responses.forEach(response => {
      body += `--${boundary}\nContent-Type: application/http\n\nHTTP/${httpVersion} ${response.status} ${response.statusText}\n`;      
      if (response.headers) {
        const headers = Object.keys(response.headers);

        headers.forEach(header => {
          body += `${header}: ${response.headers[header]}\n`
        });
      }
      body += '\n';

      const textBody = typeof response.body === 'string' ? response.body : JSON.stringify(response.body);

      body += `${textBody}\n`;
    });

    body += `--${boundary}--`;

    res.setHeader('content-type',`multipart/mixed;boundary=${boundary}`);
    res.send(Buffer.from(body)).status(status);
    resolve();
  }
}