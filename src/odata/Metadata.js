import { Router } from 'express';
import ODataResource from '../ODataResource';
import Entity from './Entity';
import Function from '../ODataFunction';
import { validate, validateIdentifier } from './validator';

export default class Metadata {
  constructor(server) {
    this._server = server;
    this._count = 0;
    this._path = '/\\$metadata';

    this.complexTypes = {};
  }

  complexType(name, properties) {
    if (this.complexTypes[name]) {
      throw new Error(`Complex type with name ${name} allready exists`);
    }

    validateIdentifier(name);

    const typeObject = {
      $Kind: 'ComplexType',
      ...properties
    };
    validate(typeObject);

    this.complexTypes[name] = typeObject;
  }

  get() {
    return this;
  }

  match(method, url) {
    if (method === 'get'
      && url.indexOf(this._path.replace(/\\/g, '')) === 0) {
      return this.middleware;
    }
    return undefined;
  }

  middleware = async (req, res, next) => {
    try {
      res.$odata.result = await this.ctrl(req);
      res.$odata.status = 200;
      res.$odata.supportedMimetypes = ['application/xml', 'application/json'];
      next();

    } catch (err) {
      next(err);
    }
  }

  _router() {
    /*eslint-disable */
    const router = Router();
    /* eslint-enable */
    router.get(this._path, this.middleware.bind(this));

    return router;
  }

  visitProperty(node, model) {
    const result = {};

    if (model.default) {
      result.$DefaultValue = model.default;
    }

    switch (node.instance) {
      case 'ObjectId':
        result.$Type = 'node.odata.ObjectId';
        break;

      case 'Boolean':
        result.$Type = 'Edm.Boolean';
        break;

      case 'Number':
        result.$Type = 'Edm.Double';
        break;

      case 'Date':
        result.$Type = 'Edm.DateTimeOffset';
        break;

      case 'String':
        result.$Type = 'Edm.String';
        if (model.maxLength) {
          result.$MaxLength = model.maxLength;
        }
        break;

      case 'Array':
        result.$Collection = true;
        if (node.schema && node.schema.paths) {
          this._count += 1;
          const notClassifiedName = `${node.path}Child${this._count}`;
          // Array of complex type
          result.$Type = `node.odata.${notClassifiedName}`;
          this.complexType(notClassifiedName, this.visitor('ComplexType', node.schema.paths, model[0]));
        } else {
          const arrayItemType = this.visitor('Property', {
            instance: node.options.type[0].name || node.options.type[0].type.name //Enums have an object with enum and type
          }, model[0]);

          result.$Type = arrayItemType.$Type;
        }
        break;

      default:
        return null;
    }

    return result;
  }

  resolveModelproperty(model, property) {
    const props = property.split('.');

    if (props.length > 1) {
      const index = property.indexOf('.') + 1;

      return this.resolveModelproperty(model[props[0]], property.substr(index));
    }

    return model[property];
  }

  visitEntityType(node, model) {
    const properties = Object.keys(node)
      .filter((path) => path !== '_id')
      .reduce((previousProperty, curentProperty) => {
        const modelProperty = this.resolveModelproperty(model, curentProperty);
        const propertyName = curentProperty.replace(/\./g, '-');
        const result = {
          ...previousProperty,
          [propertyName]: this.visitor('Property', node[curentProperty], modelProperty),
        };

        return result;
      }, {});

    return {
      $Kind: 'EntityType',
      $Key: ['id'],
      id: {
        $Type: 'node.odata.ObjectId',
        $Nullable: false,
      },
      ...properties,
    };
  }

  visitComplexType(node, model) {
    const properties = Object.keys(node)
      .filter((item) => item !== '_id')
      .reduce((previousProperty, curentProperty) => {
        const propertyName = curentProperty.replace(/\./g, '-');
        const modelProperty = this.resolveModelproperty(model, curentProperty);
        const result = {
          ...previousProperty,
          [propertyName]: this.visitor('Property', node[curentProperty], modelProperty),
        };

        return result;
      }, {});

    return properties;
  }

  static visitFunction(node) {
    return {
      $Kind: 'Function',
      ...node.params,
    };
  }

  visitor(type, node, model) {
    switch (type) {
      case 'Property':
        return this.visitProperty(node, model);

      case 'ComplexType':
        return this.visitComplexType(node, model);

      case 'Function':
        return Metadata.visitFunction(node);

      default:
        return this.visitEntityType(node, model);
    }
  }

  ctrl() {
    const entityTypeNames = Object.keys(this._server.resources);
    const entityTypes = entityTypeNames.reduce((previousResource, currentResource) => {
      const resource = this._server.resources[currentResource];
      const result = { ...previousResource };

      if (resource instanceof ODataResource) {
        const { paths } = resource.model.model.schema;

        result[currentResource] = this.visitor('EntityType', paths, resource._model);
        const actions = Object.keys(resource.actions);
        if (actions && actions.length) {
          actions.forEach((action) => {
            result[action] = resource.actions[action].getMetadata();
          });
        }
      } else if (resource instanceof Entity) {
        result[currentResource] = resource.getMetadata();
        const actions = Object.keys(resource.actions);
        if (actions && actions.length) {
          actions.forEach((action) => {
            result[action] = resource.actions[action].getMetadata();
          });
        }

      } else if (resource instanceof Function) {
        result[currentResource] = this.visitor('Function', resource);
      }

      return result;
    }, {});

    const entitySetNames = Object.keys(this._server.resources);
    const entitySets = entitySetNames.reduce((previousResource, currentResource) => {
      const result = { ...previousResource };
      const resource = this._server.resources[currentResource];

      if (resource instanceof ODataResource || resource instanceof Entity) {
        result[currentResource] = {
          $Collection: true,
          $Type: `node.odata.${currentResource}`,
        };
      } else if (resource instanceof Function) {
        result[currentResource] = {
          $Function: `node.odata.${currentResource}`,
        };
      }

      return result;
    }, {});

    const actionNames = Object.keys(this._server.actions);
    const actionImports = actionNames.reduce((previousAction, currentAction) => {
      const result = { ...previousAction };

      result[`${currentAction}-import`] = {
        $Action: `node.odata.${currentAction}`
      };

      return result;
    }, {})
    const unboundActions = actionNames.reduce((previousAction, currentAction) => {
      const result = { ...previousAction };
      const action = this._server.actions[currentAction];
      const attachToRoot = (name, value) => { result[name] = value; };

      result[currentAction] = action.getMetadata();

      return result;
    }, {})

    const document = {
      $Version: '4.0',
      ObjectId: {
        $Kind: 'TypeDefinition',
        $UnderlyingType: 'Edm.String',
        $MaxLength: 24,
      },
      ...this.complexTypes,
      ...entityTypes,
      ...unboundActions,
      $EntityContainer: 'node.odata',
      ['node.odata']: { // eslint-disable-line no-useless-computed-key
        $Kind: 'EntityContainer',
        ...entitySets,
        ...actionImports
      },
    };

    return new Promise((resolve) => {
      resolve(document);
    });
  }
}
