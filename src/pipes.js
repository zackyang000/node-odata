import http from 'http';
import XmlWriter from './metadata/xmlWriter';

const xmlWriter = new XmlWriter();

function writeJson(res, data, status, resolve) {
  res.type('application/json');
  res.status(status).jsonp(data);
  resolve(data);
}

function getMediaType(accept) {
  if (accept.match(/(application\/)?json/)) {
    return 'application/json';
  } if (accept.match(/(application\/)?xml/)) {
    return 'application/xml';
  }

  const error406 = new Error('Not acceptable');

  error406.status = 406;
  throw error406;
}

function getWriter(req, result) {
  let mediaType;

  if (req.query.$format) {
    // get requested media type from $format query
    mediaType = getMediaType(req.query.$format);
  } else if (req.headers.accept) {
    // get requested media type from accept header
    mediaType = getMediaType(req.headers.accept);
  }

  // xml representation of metadata
  switch (mediaType) {
    case 'application/json':
      return writeJson;

    case 'application/xml':
      if (result.entity) {
        // xml wirter for entities and actions is not implemented
        const error406 = new Error('Not acceptable');

        error406.status = 406;
        throw error406;
      }
      return xmlWriter.writeXml.bind(xmlWriter);

    default:
      // no media type requested set defaults depend of context
      if (result.entity) {
        return writeJson; // default for entities and actions
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
    let data;

    if (result.entity) {
      // json Representation of data
      data = result.entity;
    } else {
      // xml representation of metadata
      data = result.metadata;
    }

    writer(res, data, status, resolve);
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
