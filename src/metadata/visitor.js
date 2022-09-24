function visitDocument(node) {
  return `
  <edmx:Edmx xmlns:edmx="http://docs.oasis-open.org/odata/ns/edmx" Version="${node.$Version}">
    <edmx:DataServices>
      <Schema xmlns="http://docs.oasis-open.org/odata/ns/edm" Namespace="${node.$EntityContainer}">
        <EntityContainer Name="Container">
        </EntityContainer>
      </Schema>
    </edmx:DataServices>
  </edmx:Edmx>`;
}

function visitor(type, node) {
  switch (type) {
    case 'document':
      return visitDocument(node);

    default:
      throw new Error(`Type ${type} is not supported`);
  }
}

function writeXml(document) {
  return visitor('document', document, '', '');
}

export default writeXml;
