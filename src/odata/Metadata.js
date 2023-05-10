import { Router } from 'express';
import Resource from '../ODataResource';
import Function from '../ODataFunction';

export default class Metadata {
  constructor(server) {
    this._server = server;
    this._count = 0;
    this._path = '/\\$metadata';
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

    } catch(err) {
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

  visitProperty(node, model, root) {
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
          root(notClassifiedName, this.visitor('ComplexType', node.schema.paths, model[0], root));
        } else {
          const arrayItemType = this.visitor('Property', {
            instance: node.options.type[0].name || node.options.type[0].type.name //Enums have an object with enum and type
          }, model[0], root);

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

  visitEntityType(node, model, root) {
    const properties = Object.keys(node)
      .filter((path) => path !== '_id')
      .reduce((previousProperty, curentProperty) => {
        const modelProperty = this.resolveModelproperty(model, curentProperty);
        const propertyName = curentProperty.replace(/\./g, '-');
        const result = {
          ...previousProperty,
          [propertyName]: this.visitor('Property', node[curentProperty], modelProperty, root),
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

  visitComplexType(node, model, root) {
    const properties = Object.keys(node)
      .filter((item) => item !== '_id')
      .reduce((previousProperty, curentProperty) => {
        const propertyName = curentProperty.replace(/\./g, '-');
        const modelProperty = this.resolveModelproperty(model, curentProperty);
        const result = {
          ...previousProperty,
          [propertyName]: this.visitor('Property', node[curentProperty], modelProperty, root),
        };

        return result;
      }, {});

    return {
      $Kind: 'ComplexType',
      ...properties,
    };
  }

  static visitAction(node) {
    const result = {
      $Kind: 'Action'
    };

    if (node.binding) {
      result.$IsBound = true;
      result.$Parameter = [{
        $Name: node.resource._url,
        $Type: `node.odata.${node.resource._url}`,
        $Collection: node.binding === 'collection' ? true : undefined,
      }];
    }

    if (node.$Parameter) {
      if (!result.$Parameter) {
        result.$Parameter = [];
      }

      node.$Parameter.forEach(para => {
        const item = para;

        if (para.$Type.search(/^edm/i) === -1 ) {
          item.$Type = `${para.$Type}`;
        }

        result.$Parameter.push(item);
      });
      result.$Parameter = result.$Parameter ? result.$Parameter.concat() : node.$Parameter;
    }

    return result;
  }

  static visitFunction(node) {
    return {
      $Kind: 'Function',
      ...node.params,
    };
  }

  visitor(type, node, model, root) {
    switch (type) {
      case 'Property':
        return this.visitProperty(node, model, root);

      case 'ComplexType':
        return this.visitComplexType(node, model, root);

      case 'Action':
        return Metadata.visitAction(node);

      case 'Function':
        return Metadata.visitFunction(node, root);

      default:
        return this.visitEntityType(node, model, root);
    }
  }

  ctrl() {
    const entityTypeNames = Object.keys(this._server.resources);
    const entityTypes = entityTypeNames.reduce((previousResource, currentResource) => {
      const resource = this._server.resources[currentResource];
      const result = { ...previousResource };
      const attachToRoot = (name, value) => { result[name] = value; };

      if (resource instanceof Resource) {
        const { paths } = resource.model.model.schema;

        result[currentResource] = this.visitor('EntityType', paths, resource._model, attachToRoot);
        const actions = Object.keys(resource.actions);
        if (actions && actions.length) {
          actions.forEach((action) => {
            result[action] = this.visitor('Action', resource.actions[action], attachToRoot);
          });
        }
      } else if (resource instanceof Function) {
        result[currentResource] = this.visitor('Function', resource, attachToRoot);
      }

      return result;
    }, {});

    const entitySetNames = Object.keys(this._server.resources);
    const entitySets = entitySetNames.reduce((previousResource, currentResource) => {
      const result = { ...previousResource };
      const resource = this._server.resources[currentResource];

      if (resource instanceof Resource) {
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
      const result = {...previousAction};
      const action = this._server.actions[currentAction];

      result[`${currentAction}-import`] = {
        $Action: `node.odata.${currentAction}`
      };

      return result;
    }, {})
    const unboundActions = actionNames.reduce((previousAction, currentAction) => {
      const result = {...previousAction};
      const action = this._server.actions[currentAction];
      const attachToRoot = (name, value) => { result[name] = value; };

      result[currentAction] = this.visitor('Action', action, attachToRoot);

      return result;
    }, {})

    const document = {
      $Version: '4.0',
      ObjectId: {
        $Kind: 'TypeDefinition',
        $UnderlyingType: 'Edm.String',
        $MaxLength: 24,
      },
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
