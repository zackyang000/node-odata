export default class MimetypeParser {
  constructor() {
    this._regexes = {
      'application/xml': /((application|\*)\/(xml|\*)|^xml$)/,
      'application/json': /((application|\*)\/(json|\*)|^json$)/,
      'multipart/mixed': /multipart\/mixed/
    };
  }

  getmMediaType(format, accept, supportedFormats, requrestContentType) {
     if (format) {
      // get requested media type from $format query
      return this._getMediaType(format, supportedFormats);
    } else if (accept) {
      // get requested media type from accept header
      return this._getMediaType(accept, supportedFormats);
    } else if (requrestContentType) {
      return requrestContentType;
    }

    return supportedFormats[0];
  }

  _getMediaType(header, supportedTypes) {
    // reduce multi mimetypes to most weigth mimetype
    // e.g. Accept: text/html, application/xhtml+xml, application/xml;q=0.9, image/webp, */*;q=0.8
    const mimeStructs = header.split(/[ ,]+/g);
    const mostWeightMimetype = mimeStructs.reduce((previous, current) => {
      const [mimetype, qualityParam] = current.split(/[ ;]+/);
      const [, qualityValue] = qualityParam ? qualityParam.split(/=/) : ['q', 1];
      const result = {
        ...previous,
      };

      const supported = supportedTypes.find(item => mimetype.match(this._regexes[item]));
  
      if (supported
          && (!previous.mimetype || previous.qualityValue < qualityValue)) {
        result.mimetype = supported;
        result.qualityValue = qualityValue;
      }
      return result;
    }, {});

    if (mostWeightMimetype.mimetype) {
      return mostWeightMimetype.mimetype;
    }
  
    const error406 = new Error('Not acceptable');
  
    error406.status = 406;
    throw error406;
  }
}