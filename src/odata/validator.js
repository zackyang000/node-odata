
export const validateIdentifier = (identifier) => {
  if (!identifier || !identifier.match(/^^[_a-zA-Z0-9][_a-zA-Z0-9.-]*$/)) {
    throw new Error(`Invalid simple identifier '${identifier}'`);
  }
}


function shouldContains(property,  member, list) {
  if (property[member] && list.indexOf(property[member]) === -1
    && (!property[member].match(/node\.odata/) || member != '$Type')) {// custom type
    throw new Error(`${member} '${property[member]}' is invalid`);
  }
}

function validateType(property, member) {
  const types = ['Edm.Binary', 'Edm.Boolean', 'Edm.Byte', 'Edm.Date',
    'Edm.DateTimeOffset', 'Edm.Decimal', 'Edm.Double', 'Edm.Duration', 'Edm.Guid',
    'Edm.Int16', 'Edm.Int32', 'Edm.Int64', 'Edm.SByte', 'Edm.Single',
    'Edm.Stream', 'Edm.String', 'Edm.TimeOfDay', 'Edm.Geography', 'Edm.GeographyPoint',
    'Edm.GeographyLineString', 'Edm.GeographyPolygon', 'Edm.GeographyMultiPoint', 'Edm.GeographyMultiLineString',
    'Edm.GeographyMultiPolygon', 'Edm.GeographyCollection', 'Edm.Geometry', 'Edm.GeometryPoint', 'Edm.GeometryLineString',
    'Edm.GeometryPolygon', 'Edm.GeometryMultiPoint', 'Edm.GeometryMultiLineString', 'Edm.GeometryMultiPolygon',
    'Edm.GeometryCollection'];

  shouldContains(property, member.trim(), types);

}

function validateSRID(name, property) {
  if (!property[name]) {
    throw new Error(`If SRID is given, then the value had to be supplied`);
  }
  if (property[name] !== 'variable') {
    const srid = +(property[name]);

    if (Number.isNaN(srid)) {
      throw new Error(`'${srid}' is invalid value for SRID of ${name} property`);
    }
    if (srid < 0) {
      throw new Error(`SRID has to be a non negative value. Current '${srid}'`);
    }
  }
}

function validateMaxLength(name, property, member) {
  const maxLength = property[name].member;

  if (!maxLength) {
    throw new Error(`If MaxLength is given, than the value had to be supplied`);
  }

  if (Number.isNaN(+maxLength)) {
    throw new Error(`Value '${maxLength}' is invalid for MaxLength`);
  }

  if (+maxLength < 1) {
    throw new Error(`If MaxLength is given, than the value had to be supplied`)
  }

}

export const validateProperty = (name, property) => {
  validateIdentifier(name);

  const members = Object.keys(property);

  members.forEach(member => {
    const allowedMembers = ['$Type', '$Collection', '$Nullable', '$MaxLength',
      '$Unicode', '$Precision', '$Scale', '$SRID', '$DefaultValue'];

    switch (member.trim()) {
      case '$Type':
        validateType(property, member);
        break;

      case '$Collection':
      case '$Nullable':
      case '$Unicode':
        const boolean = [true, false];

        shouldContains(property[name], member.trim(), boolean);
        break;

      case '$SRID':
        validateSRID(name, property);
        break;

      case '$MaxLength':
        validateMaxLength(name, property, member);
        break;

      case '$DefaultValue':
        break;

      default:
        throw new Error(`'${member.trim()}' ist not allowed as member of property '${name}'`);
    }
  });
}

const validateParameter = parameter => {
  if (!parameter) {
    throw new Error('Parameter should not be undefined');
  }

  if (!parameter.$Name) {
    throw new Error('$Name of Parameter should be given');
  }

  const clone = JSON.parse(JSON.stringify(parameter));

  delete clone.$Name;

  validateProperty(parameter.$Name, clone);
}

export const validateParameters = parameter => {
  if (!parameter) {
    throw new Error('Parameter should not be undefined or null');
  }

  if (!Array.isArray(parameter)) {
    throw new Error('Parameter should be an array of parameters');
  }

  parameter.forEach(item => validateParameter(item));
}

function validateComplexType(node) {
  const properties = Object.keys(node);

  properties.filter(name => name !== '$Kind')
    .forEach(name => validateProperty(name, node[name]));
}

export const validate = node => {
  if (!node) {
    throw new Error('For validation an object should not be undefined');
  }

  switch(node.$Kind) {
    case 'ComplexType':
      validateComplexType(node);
      break;
    
      default:
        throw new Error('For validation an object need a property $Kind');
  }
}