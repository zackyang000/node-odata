
export const validateIdentifier = (identifier) => {
  if (!identifier || !identifier.match(/^^[_a-zA-Z0-9][_a-zA-Z0-9.-]*$/)) {
    throw new Error(`Invalid simple identifier '${identifier}'`);
  }
}


function shouldContains(property, member, list) {
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

function shouldBePositive(name, property, member) {
  const value = property[member];

  if (!value) {
    throw new Error(`If '${member}' is given, than the value had to be supplied`);
  }

  if (Number.isNaN(+value)) {
    throw new Error(`Value '${value}' is invalid for '${member}'`);
  }

  if (+value < 1) {
    throw new Error(`If '${member}' is given, than the value had to be supplied`)
  }

}

export const validateProperty = (name, property) => {
  validateIdentifier(name);

  const members = Object.keys(property);
  const allowedMembers = ['$Type', '$Collection', '$Nullable', '$MaxLength',
    '$Unicode', '$Precision', '$Scale', '$SRID', '$DefaultValue'];
  const boolean = [true, false];

  members.forEach(member => {
    switch (member.trim()) {
      case '$Type':
        validateType(property, member);
        break;

      case '$Collection':
      case '$Nullable':
      case '$Unicode':
        shouldContains(property, member.trim(), boolean);
        break;

      case '$SRID':
        validateSRID(name, property);
        break;

      case '$MaxLength':
      case '$Precision':
      case '$Scale':
        shouldBePositive(name, property, member);
        break;

      case '$DefaultValue':
        break;

      default:
        const trimmedMember = member.trim();

        if (!trimmedMember.match(/^(@\w+(\.\w+)?(#\w+)?)+$/)) { // annotations should be ignored
          throw new Error(`'${trimmedMember}' ist not allowed as member of property '${name}'`);
        }
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

  if (!properties.length) {
    throw new Error('ComplexType without properties is not allowed')
  }
}

function validateEntityType(node) {
  const attributes = Object.keys(node);

  if (!node.$Key || !node.$Key.length) {
    throw new Error('EntityType without key is not allowed')
  }

  if (!Array.isArray(node.$Key)) {
    throw new Error('$Key of Entitytype has to be an array of property names');
  }

  const properties = attributes.filter(name => name !== '$Kind' && name !== '$Key' && name[0] != '@');

  properties.forEach(name => validateProperty(name, node[name]));

  if (!properties.length) {
    throw new Error('ComplexType without properties is not allowed')
  }

  node.$Key.forEach(key => {
    if (properties.indexOf(key) === -1) {
      throw new Error(`EntityType has not a property for $Key with name "${key}"`)
    }
  });
}

export const validate = node => {
  if (!node) {
    throw new Error('For validation an object should not be undefined');
  }

  switch (node.$Kind) {
    case 'ComplexType':
      validateComplexType(node);
      break;

    case 'EntityType':
      validateEntityType(node);
      break;

    default:
      throw new Error('For validation an object need a property $Kind');
  }
}