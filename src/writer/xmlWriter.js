export default class XmlWriter {
  visitor(type, node, name) {
    switch (type) {
      case 'document':
        return this.visitDocument(node);

      case 'EntityType':
        return this.visitEntityType(node, name);

      case 'Property':
        return this.visitProperty(node, name);

      case 'EntityContainer':
        return this.visitEntityContainter(node);

      case 'EntitySet':
        return this.visitEntitySet(node, name);

      case 'Singleton':
        return this.visitSingleton(node, name);

      case 'TypeDefinition':
        return this.visitTypeDefinition(node, name);

      case 'ComplexType':
        return this.visitComplexType(node, name);

      case 'Action':
        return this.visitAction(node, name);

      case 'ActionImport':
        return this.visitActionImport(node, name);

      case 'Function':
        return this.visitFunction(node, name);

      case 'FunctionImport':
        return this.visitFunctionImport(node, name);

      case 'Term':
        return this.visitTerm(node, name);

      default:
        throw new Error(`Type ${type} is not supported`);
    }
  }

  visitTerm(node, name) {
    const appliesTo = node.$AppliesTo.reduce((previos, current) => {
      return previos ? `${previos} ${current}` : current;
    }, "");

    return `
    <Term Name="${name}" Type="${node.$Type}" AppliesTo="${appliesTo}"/>
    `;
  }

  visitDocument(node) {
    let body = '';

    this.document = node;

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

  visitEntitySet(node, name) {
    return `<EntitySet Name="${name}" EntityType="${node.$Type}"/>`;
  }

  visitSingleton(node, name) {
    return `<Singleton Name="${name}" Type="${node.$Type}"/>`;
  }

  visitEntityContainter(node) {
    let entitySets = '';
    let singletons = '';
    let functions = '';
    let actions = ''

    Object.keys(node)
      .filter((item) => item !== '$Kind')
      .forEach((item) => {
        if (node[item].$Collection === true) {
          entitySets += this.visitor('EntitySet', node[item], item);
        } else if (node[item].$Type) {
          singletons += this.visitor('Singleton', node[item], item);
        } else if (node[item].$Action) {
          actions += this.visitor('ActionImport', node[item], item);
        } else {
          functions += this.visitor('FunctionImport', node[item], item);
        }
      });
    return (
      `<EntityContainer Name="Container">
    ${entitySets}${singletons}${functions}${actions}
  </EntityContainer>`);
  }

  visitProperty(node, name) {
    const type = node.$Collection ? `Collection(${node.$Type})` : node.$Type;
    const annotations = Object.keys(node)
      .filter(attribute => attribute[0] === '@')
      .reduce((previous, current) => `${previous}${this.visitAnnotation(node[current], current)}`, "");
    let attributes = '';

    if (node.$Nullable) {
      attributes += ' Nullable="true"';
    }
    if (node.$MaxLength) {
      attributes += ` MaxLength="${node.$MaxLength}"`;
    }
    if (node.$DefaultValue) {
      attributes += ` DefaultValue="${node.$DefaultValue}"`;
    }

    if (!annotations) {
      return `<Property Name="${name}" Type="${type}"${attributes}/>`;
    }
    return `<Property Name="${name}" Type="${type}"${attributes}>
                ${annotations}
              </Property>`;

  }

  visitAnnotation(node, name) {
    const termName = name.substr(1);
    const term = this.document[termName];

    if (!term) {
      throw new Error(`Term '${termName}' is not defined in scope`);
    }

    const type = term.$Type.split('.')[1];

    return `
    <Annotation Term="${termName}">
      <${type}>${node}</${type}>
    </Annotation>`;
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

  visitTypeDefinition(node, name) {
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

  visitAction(node, name) {
    const isBound = node.$IsBound ? ' IsBound="true"' : '';
    const parameter = node.$Parameter && node.$Parameter
      .map((item) => {
        const annotations = Object.keys(item)
          .filter(attribute => attribute[0] === '@')
          .reduce((previous, current) => `${previous}${this.visitAnnotation(item[current], current)}`, "");
        let type = '';

        if (item.$Collection) {
          type = ` Type="Collection(${item.$Type})"`;
        } else if (item.$Type) {
          type = ` Type="${item.$Type}"`;
        }
        if (!annotations) {
          return `<Parameter Name="${item.$Name}"${type}/>`;
        }
        return `<Parameter Name="${item.$Name}"${type}>
                  ${annotations}
                </Parameter>`;
      })
      .reduce((previos, current) => `${previos}${current}`, '');

    debugger;
    return (`
  <Action Name="${name}"${isBound}>
    ${parameter || ''}
  </Action>
  `);
  }

  visitActionImport(node, name) {
    return (`
  <ActionImport Name="${name}" Action="${node.$Action}"/>
  `);
  }

  visitFunction(node, name) {
    const type = node.$ReturnType.$Collection ? `Collection(${node.$ReturnType.$Type})` : node.$ReturnType.$Type;

    return (`
  <Function Name="${name}">
    <ReturnType Type="${type}"/>
  </Function>
  `);
  }

  visitFunctionImport(node, name) {
    return (`
  <FunctionImport Name="${name}" Function="${node.$Function}"/>
  `);
  }

  writeXml(res, data, status) {
    const xml = this.visitor('document', data, '', '').replace(/\s*</g, '<').replace(/>\s*/g, '>');

    res.type('application/xml');
    res.status(status).send(xml);
  }
}
