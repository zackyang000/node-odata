import list from './rest/list';
import post from './rest/post';
import put from './rest/put';
import del from './rest/delete';
import patch from './rest/patch';
import get from './rest/get';
import count from './rest/count';
import { validate, validateIdentifier } from '../odata/validator';

export default class MongoEntity {
  constructor(name, model, annotations, mapping) {
    this.name = name;
    this.model = model;
    this.annotations = annotations;

    this.complexTypes = {};
    this.count = 0;
    this.mapping = {
      id: {
        target: '_id',
        attributes: {
          $Type: 'Edm.String',
          $MaxLength: 24
        }
      },
      ...mapping
    };

  }

  getHandler() {
    const rest = {
      post,
      put,
      patch,
      delete: del,
      get,
      count,
      list
    };
    const routes = Object.keys(rest);
    let handler = {};

    routes.forEach((route) => {
      handler[route] = async (req, res, next) => {
        try {
          req.$odata = {
            ...req.$odata,
            Model: this.model
          };
          await rest[route](req, res, next);

        } catch (err) {
          next(err);
        }
      };
    });

    return handler;
  }

  getMetadata() {
    if (!this.metadata) {
      const { paths } = this.model.schema;

      this.metadata = this.visitor('EntityType', paths);
    }

    return this.metadata;
  }

  getMapping() {
    if (!this.metadata) {
      this.getMetadata();
    }

    return this.mapping;
  }

  getComplexTypes() {
    if (!this.metadata) {
      this.getMetadata();
    }

    return this.complexTypes;
  }

  visitor(type, node) {
    switch (type) {
      case 'Property':
        return this.visitProperty(node);

      case 'ComplexType':
        return this.visitComplexType(node);

      default:
        return this.visitEntityType(node);
    }
  }

  visitProperty(node) {
    let result = {};

    if (node.selected === false) {// hidden field
      return;
    }

    if (!node.isRequired) {
      result.$Nullable = true;
    }

    if ('Array ObjectID'.indexOf(node.instance) === -1 && node.defaultValue) {
      result.$DefaultValue = node.defaultValue;
    }

    switch (node.instance) {
      case 'Boolean':
        result.$Type = 'Edm.Boolean';
        break;

      case 'Number':
        result.$Type = 'Edm.Double';
        break;

      case 'Date':
        // annotate generated timestamps as readonly
        const { createdAt, updatedAt } = this.model.schema.$timestamps;

        if ((node.path === createdAt || node.path === updatedAt)
          && this.annotations.isDefined('readonly')) {
        debugger;
          result = {
            ...result,
            ...this.annotations.annotate('readonly', 'Property', true)
          };
        }

        result.$Type = 'Edm.DateTimeOffset';
        break;

      case 'String':
        result.$Type = 'Edm.String';
        if (node.options?.maxLength) {
          result.$MaxLength = node.options.maxLength;
        }
        break;

      case 'Array':
        result.$Collection = true;
        if (node.schema && node.schema.paths) {
          // Array of complex type
          result.$Type = this.complexType(node);
        } else {
          const arrayItemType = this.visitor('Property', {
            instance: node.options.type[0].name || node.options.type[0].type.name //Enums have an object with enum and type
          });

          if (!arrayItemType) { // hidden properties returns undefined
            return;
          }

          result.$Type = arrayItemType.$Type;
        }
        break;

      default:
        return null;
    }

    return result;
  }

  complexType(node) {
    const mapping = Object.keys(this.mapping).find(item => this.mapping[item].target === node.path);

    if (mapping && this.mapping[mapping].attributes?.$Type) {
      return this.mapping[mapping].attributes?.$Type;
    }

    this.count += 1;

    const notClassifiedName = `${this.name}${node.path}Child${this.count}`;
    const properties = this.visitor('ComplexType', node.schema.paths);

    if (this.complexTypes[notClassifiedName]) {
      throw new Error(`Complex type with name ${notClassifiedName} allready exists`);
    }

    validateIdentifier(notClassifiedName);

    const typeObject = {
      $Kind: 'ComplexType',
      ...properties
    };
    validate(typeObject);

    this.complexTypes[notClassifiedName] = typeObject;

    return `node.odata.${notClassifiedName}`;
  }

  visitComplexType(node) {
    return this.reduceProperties(node);
  }

  reduceProperties(node) {
    const keys = Object.keys(node);
    const simpleProperties = keys.filter((path) => path !== '__v' && path.indexOf('.') === -1)
      .reduce((previousProperty, curentProperty) => {
        let result;
        let propertyName = Object.keys(this.mapping)
          .find(name => this.mapping[name]?.target === curentProperty);

        if (propertyName && this.mapping[propertyName].attributes) {
          result = {
            ...previousProperty,
            [propertyName]: this.mapping[propertyName].attributes
          };

        } else {
          propertyName = curentProperty.replace(/\./g, '-');
          if (propertyName !== curentProperty) {
            this.addMapping(curentProperty, propertyName);
          }

          const property = this.visitor('Property', node[curentProperty]);

          result = property ? {
            ...previousProperty,
            [propertyName]: property
          } : previousProperty;

        }

        return result;
      }, {});

    const deepNodes = keys.filter(key => {
      if (key.indexOf('.') >= 0) {
        return true;
      }
    })
      .reduce((previousProperty, curentProperty) => {
        const nameParts = curentProperty.split('.');
        const objName = nameParts[0];
        const propertyName = curentProperty.substring(objName.length + 1);

        if (!previousProperty[objName]) {
          // not first property of an object
          previousProperty[objName] = {
            path: objName,
            schema: {
              paths: {}
            }
          };
        }

        previousProperty[objName].schema.paths[propertyName] = {
          ...node[curentProperty],
          path: propertyName
        };

        return previousProperty;
      }, {});

    const deepProperties = Object.keys(deepNodes)
      .reduce((previousProperty, curentProperty) => {
        previousProperty[curentProperty] = {
          $Type: this.complexType(deepNodes[curentProperty])
        };

        return previousProperty;
      }, {});

    return {
      ...simpleProperties,
      ...deepProperties
    }
  }

  visitEntityType(node) {
    const properties = this.reduceProperties(node);

    return {
      $Key: ['id'],
      ...properties,
    };
  }

  addMapping(mongoProperty, odataProperty) {
    if (this.mapping[odataProperty]) {
      throw new Error(`Mapping for property '${odataProperty}' is already set`);
    }

    this.mapping[odataProperty] = {
      target: mongoProperty
    };
  }

}
