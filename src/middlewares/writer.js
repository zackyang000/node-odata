import XmlWriter from '../writer/xmlWriter';
import JsonWirter from '../writer/jsonWriter';
import MultipartWriter from '../writer/multipartWriter';
import MimetypeParser from '../parser/mimetypeParser'

const xmlWriter = new XmlWriter();
const jsonWriter = new JsonWirter();
const multipartWriter = new MultipartWriter();

function getContentType(req) {
  if (req.headers && req.headers['content-type']) {
    const result = req.headers['content-type'];

    return result.indexOf(';') > 0 ? result.split(';')[0] : result;
  }
}

function getWriter(req, res, result) {
  const supportedFormats = res.$odata.supportedMimetypes;
  let format = req.query.$format;

  let accept;
  let requrestContentType;
  if (req.headers) {
    accept = req.headers.accept ? req.headers.accept : undefined;
    requrestContentType = result.responses && getContentType(req) ? getContentType(req) : undefined;
  }

  const mimetyeParser = new MimetypeParser();
  const mediaType = mimetyeParser.getmMediaType(format, accept, supportedFormats, requrestContentType);

  res.type(mediaType);

  // xml representation of metadata
  switch (mediaType) {
    case 'application/json':
      return jsonWriter.writeJson.bind(jsonWriter);

    case 'application/xml':
      return xmlWriter.writeXml.bind(xmlWriter);

    case 'multipart/mixed':
      return multipartWriter.write.bind(multipartWriter);

    case 'text/plain':
      return (res, data, status) => {
        res.status(status).send(data);
      };

    default:
      const error406 = new Error('Not acceptable');

      error406.status = 406;
      throw error406;
  }
}

function writeMessages(res) {
  if (res.$odata.messages.length) {
    res.$odata.messages.forEach(msg => {
      if (!msg.code) {
        throw new Error(`Missing 'code' property in message`);
      }
      if (!msg.message) {
        throw new Error(`Missing 'message' property in message`);
      }
      if (!msg.numericSeverity) {
        throw new Error(`Missing 'numericSeverity' property in message`);
      }
      if ([1,2,3,4].indexOf(msg.numericSeverity) === -1) {
        throw new Error(`Value '${msg.numericSeverity}' is invalid for severity`);
      }
    });
    res.setHeader('sap-messages', JSON.stringify(res.$odata.messages));
  }
}

export default function writer(req, res) {
  writeMessages(res);

  switch (res.$odata.status) {
    case 404:
      // not found or no handler worked on
      const err = new Error('Not found');
      err.status = 404;
      throw err;

    case 204:// no content
      res.status(res.$odata.status).end();
      return;

    case undefined:
      throw new Error('Status not setted');

    default:
      if (res.$odata.result === undefined) {
        throw new Error('If status not equal 204 res.$odata.result has to be set');
      }
  }

  const status = res.$odata.status;
  const writer = getWriter(req, res, res.$odata.result);

  res.setHeader('OData-Version', `4.0`);
  writer(res, res.$odata.result, status, req.httpVersion);

}