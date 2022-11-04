import http from 'http';
import XmlWriter from './writer/xmlWriter';
import JsonWirter from './writer/jsonWriter';

const xmlWriter = new XmlWriter();
const jsonWriter = new JsonWirter();

function getMediaType(accept, data) {
  // reduce multi mimetypes to most weigth mimetype
  // e.g. Accept: text/html, application/xhtml+xml, application/xml;q=0.9, image/webp, */*;q=0.8
  const mimeStructs = accept.split(/[ ,]+/g);
  const mostWeightMimetype = mimeStructs.reduce((previous, current) => {
    const [mimetype, qualityParam] = current.split(/[ ;]+/);
    const [, qualityValue] = qualityParam ? qualityParam.split(/=/) : ['q', 1];
    const result = {
      ...previous,
    };

    if (!previous.mimetype || previous.qualityValue < qualityValue) {
      result.mimetype = mimetype;
      result.qualityValue = qualityValue;
    }
    return result;
  }, {});

  if (data.metadata && mostWeightMimetype.mimetype.match(/((application|\*)\/(xml|\*)|^xml$)/)) {
    return 'application/xml';
  } if (mostWeightMimetype.mimetype.match(/((application|\*)\/(json|\*)|^json$)/)) {
    return 'application/json';
  }

  const error406 = new Error('Not acceptable');

  error406.status = 406;
  throw error406;
}

function getWriter(req, result) {
  let mediaType;

  if (req.query.$format) {
    // get requested media type from $format query
    mediaType = getMediaType(req.query.$format, result);
  } else if (req.headers.accept) {
    // get requested media type from accept header
    mediaType = getMediaType(req.headers.accept, result);
  }

  // xml representation of metadata
  switch (mediaType) {
    case 'application/json':
      return jsonWriter.writeJson.bind(jsonWriter);

    case 'application/xml':
      if (!result.metadata) {
        // xml wirter for entities and actions is not implemented
        const error406 = new Error('Not acceptable');

        error406.status = 406;
        throw error406;
      }
      return xmlWriter.writeXml.bind(xmlWriter);

    default:
      // no media type requested set defaults depend of context
      if (result.entity || result.serviceDocument) {
        return jsonWriter.writeJson.bind(jsonWriter); // default for entities and actions
      }

      return xmlWriter.writeXml.bind(xmlWriter); // default for metadata
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

    writer(res, result, status, resolve);
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
