export default class XmlWriter {
  visitor(type, node, name) {
    switch (type) {
      case 'document':
        return this.visitDocument(node);

      case 'EntityType':
        return this.visitEntityType(node, name);

      case 'Property':
        return XmlWriter.visitProperty(node, name);

      case 'EntityContainer':
        return this.visitEntityContainter(node);

      case 'EntitySet':
        return XmlWriter.visitEntitySet(node, name);

      case 'TypeDefinition':
        return XmlWriter.visitTypeDefinition(node, name);

      case 'ComplexType':
        return this.visitComplexType(node, name);

      case 'Action':
        return XmlWriter.visitAction(node, name);

      case 'Function':
        return XmlWriter.visitFunction(node, name);

      case 'FunctionImport':
        return XmlWriter.visitFunctionImport(node, name);

      default:
        throw new Error(`Type ${type} is not supported`);
    }
  }

  visitDocument(node) {
    let body = '';

    Object.keys(node).forEach((subnode) => {
      if (node[subnode].$Kind) {
        body += this.visitor(node[subnode].$Kind, node[subnode], subnode);
      }
    });

    return (
      `<edmx:Edmx xmlns:edmx="http://docs.oasis-open.org/odata/ns/edmx" Version="${node.$Version}">
    <edmx:DataServices>
      <Schema xmlns="http://docs.oasis-open.org/odata/ns/edm" Namespace="${node.$EntityContainer}">
        ${body}
      </Schema>
    </edmx:DataServices>
  </edmx:Edmx>`);
  }

  static visitEntitySet(node, name) {
    return `<EntitySet Name="${name}" EntityType="${node.$Type}"/>`;
  }

  visitEntityContainter(node) {
    let entitySets = '';
    let functions = '';

    Object.keys(node)
      .filter((item) => item !== '$Kind')
      .forEach((item) => {
        if (node[item].$Type) {
          entitySets += this.visitor('EntitySet', node[item], item);
        } else {
          functions += this.visitor('FunctionImport', node[item], item);
        }
      });
    return (
      `<EntityContainer Name="Container">
    ${entitySets}${functions}
  </EntityContainer>`);
  }

  static visitProperty(node, name) {
    let attributes = '';

    if (node.$Nullable === false) {
      attributes += ' Nullable="false"';
    }
    if (node.$MaxLength) {
      attributes += ` MaxLength="${node.$MaxLength}"`;
    }
    if (node.$Collection) {
      attributes += ' Collection="true"';
    }
    if (node.$DefaultValue) {
      attributes += ` DefaultValue="${node.$DefaultValue}"`;
    }

    return `<Property Name="${name}" Type="${node.$Type}"${attributes}/>`;
  }

  visitEntityType(node, name) {
    let properties = '';

    Object.keys(node)
      .filter((item) => item !== '$Kind' && item !== '$Key')
      .forEach((item) => {
        properties += this.visitor('Property', node[item], item);
      });

    return (
      `<EntityType Name="${name}">
    <Key>
      <PropertyRef Name="${node.$Key}"/>
    </Key>
    ${properties}
  </EntityType>`);
  }

  static visitTypeDefinition(node, name) {
    let attributes = '';

    if (node.$MaxLength) {
      attributes += ` MaxLength="${node.$MaxLength}"`;
    }

    return (
      `<TypeDefinition Name="${name}" UnderlyingType="${node.$UnderlyingType}"${attributes}>
    </TypeDefinition>`);
  }

  visitComplexType(node, name) {
    let properties = '';

    Object.keys(node)
      .filter((item) => item !== '$Kind')
      .forEach((item) => {
        properties += this.visitor('Property', node[item], item);
      });

    return (`
  <ComplexType Name="${name}">
    ${properties}
  </ComplexType>`);
  }

  static visitAction(node, name) {
    const isBound = node.$IsBound ? ' IsBound="true"' : '';
    const parameter = node.$Parameter.map((item) => {
      let type = '';

      if (item.$Collection) {
        type = ` Type="Collection(${item.$Type})"`;
      } else if (item.$Type) {
        type = ` Type="${item.$Type}"`;
      }

      return `<Parameter Name="${item.$Name}"${type}/>`;
    });

    return (`
  <Action Name="${name}"${isBound}>
    ${parameter}
  </Action>
  `);
  }

  static visitFunction(node, name) {
    const collection = node.$ReturnType.$Collection ? ' Collection="true"' : '';

    return (`
  <Function Name="${name}">
    <ReturnType Type="${node.$ReturnType.$Type}"${collection}/>
  </Function>
  `);
  }

  static visitFunctionImport(node, name) {
    return (`
  <FunctionImport Name="${name}" Function="${node.$Function}"/>
  `);
  }

  writeXml(res, data, status, resolve) {
    const xml = this.visitor('document', data.$metadata, '', '').replace(/\s*</g, '<').replace(/>\s*/g, '>');

    res.type('application/xml');
    res.status(status).send(xml);
    resolve(data);
  }
}
