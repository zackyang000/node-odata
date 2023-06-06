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

export default function writer(req, res) {
  switch (res.$odata.status) {
    case 404:
      // not found or no handler worked on
      const err = new Error();
      err.status = 404;
      throw err;

    case 204:// no content
      res.status(res.$odata.status).end();
      return;

    case undefined:
      throw new Error('Status not setted');

    default:
  }

  const status = res.$odata.status;
  const writer = getWriter(req, res, res.$odata.result);

  res.setHeader('OData-Version', `4.0`);
  writer(res, res.$odata.result, status, req.httpVersion);

}