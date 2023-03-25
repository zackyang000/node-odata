import http from 'http';
import XmlWriter from './writer/xmlWriter';
import JsonWirter from './writer/jsonWriter';
import MultipartWriter from './writer/multipartWriter';
import MimetypeParser from './parser/mimetypeParser'

const xmlWriter = new XmlWriter();
const jsonWriter = new JsonWirter();
const multipartWriter = new MultipartWriter();

function getContentType(req) {
  if (req.headers && req.headers['content-type']) {
    const result = req.headers['content-type'];

    return result.indexOf(';') > 0 ? result.split(';')[0] : result;
  }
}

function getWriter(req, result) {
  let supportedFormats;
  let format = req.query.$format;
  
  if (result.$metadata) {
    supportedFormats = ['application/xml', 'application/json'];
  }  else if(result.responses) {
    supportedFormats = ['multipart/mixed', 'application/json'];
    format = '';
  } else {
    supportedFormats = ['application/json'];
  }

  let accept;
  let requrestContentType;
  if (req.headers) {
    accept = req.headers.accept ? req.headers.accept : undefined;
    requrestContentType = result.responses && getContentType(req) ? getContentType(req) : undefined;
  }

  const mimetyeParser = new MimetypeParser();
  const mediaType = mimetyeParser.getmMediaType(format, accept, supportedFormats, requrestContentType);

  // xml representation of metadata
  switch (mediaType) {
    case 'application/json':
      return jsonWriter.writeJson.bind(jsonWriter);

    case 'application/xml':
      return xmlWriter.writeXml.bind(xmlWriter);

    case 'multipart/mixed':
      return multipartWriter.write.bind(multipartWriter);

    default:
      const error406 = new Error('Not acceptable');

      error406.status = 406;
      throw error406;
  }
}

const authorizePipe = (req, res, auth) => new Promise((resolve, reject) => {
  if (auth !== undefined) {
    if (!auth(req, res)) {
      const result = new Error();

      result.status = 401;
      reject(result);
      return;
    }
  }
  resolve();
});

const beforePipe = (req, res, before) => new Promise((resolve) => {
  if (before) {
    before(req.body, req, res);
  }
  resolve();
});

const respondPipe = (req, res, result) => new Promise((resolve, reject) => {
  try {
    if (result.status === 204) { // no content
      res.status(204).end();
      resolve();
      return;
    }

    const status = result.status || 200;
    const writer = getWriter(req, result);

    res.setHeader('OData-Version',`4.0`);
    writer(res, result, status, resolve, req.httpVersion);
  } catch (error) {
    reject(error);
  }
});

const afterPipe = (req, res, after, data) => new Promise((resolve) => {
  if (after) {
    after(data, req.body, req, res);
  }
  resolve();
});

const errorPipe = (req, res, err) => new Promise(() => {
  const status = err.status || 500;
  const text = err.text || err.message || http.STATUS_CODES[status];
  res.status(status).send(text);
});

export default {
  afterPipe,
  authorizePipe,
  beforePipe,
  errorPipe,
  respondPipe,
};
