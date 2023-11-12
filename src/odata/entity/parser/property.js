export default function parseProperty(filter, mapping) {
  let property = filter?.trim();

  if (mapping[property]) {
    property = mapping[property].intern;

  }

  return property;
}