function parseBoolean(value, metadata) {
  if (value === 'true') {
    return true;
  }

  if (value === 'false') {
    return false;
  }

  const err = new Error(`Text '${value}' is not valid boolean representation`);

  err.status = 400;
  throw err;
}

function parseNumber(value, metadata) {
  const result = +value;

  if (Number.isNaN(value)) {
    const err = new Error(`Text '${value}' is not valid represenation of a number`);

    err.status = 400;
    throw err;
  }

  return result;
}

function parseDate(value, metadata) {
  const result = new Date(value);

  if (Number.isNaN(result.valueOf())) {
    const err = new Error(`Text '${value}' is not valid represenation of a date`);

    err.status = 400;
    throw err;
  }
}

export default function (value, metadata) {
  const trimmed = value.trim();

  debugger;
  if (metadata.$Nullable && trimmed === 'null') {
    return null;
  }

  switch (metadata.$Type) {
    case 'Edm.Boolean':
      return parseBoolean(trimmed, metadata);

    case 'Edm.Byte':
    case 'Edm.Decimal':
    case 'Edm.Double':
    case 'Edm.Duration':
    case 'Edm.Int16':
    case 'Edm.Int32':
    case 'Edm.Int64':
    case 'Edm.SByte':
    case 'Edm.Single':
      return parseNumber(trimmed, metadata);

    case 'Edm.Date':
    case 'Edm.DateTimeOffset':
    case 'Edm.Duration':
    case 'Edm.TimeOfDay':
      return parseDate(trimmed, metadata);

    default:
      return trimmed;
  }

}