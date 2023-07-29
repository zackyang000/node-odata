import { Router } from 'express';
import Entity from './entity/Entity';
import Function from '../ODataFunction';
import { validate, validateIdentifier } from './validator';

export default class Metadata {
  constructor(server) {
    this._server = server;
    this._path = '/\\$metadata';

    this.complexTypes = {};
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

  static visitFunction(node) {
    return {
      $Kind: 'Function',
      ...node.params,
    };
  }

  visitor(type, node, model) {
    return Metadata.visitFunction(node);
  }

  complexType(name, properties) {
    if (this.complexTypes[name]) {
      throw new Error(`Complex type with name ${name} allready exists`);
    }

    if (!properties) { // get call
      const returnType = name.replace('node.odata.', '');

      if (!this.complexTypes[returnType]) {
        throw new Error(`Complex type with name ${name} does not exists`);
      }

      return this.complexTypes[returnType];
    }

    validateIdentifier(name);

    const typeObject = {
      $Kind: 'ComplexType',
      ...properties
    };
    validate(typeObject);

    this.complexTypes[name] = typeObject;
  }

  ctrl() {
    const entityTypeNames = Object.keys(this._server.resources);
    const entityTypes = entityTypeNames.reduce((previousResource, currentResource) => {
      const resource = this._server.resources[currentResource];
      const result = { ...previousResource };

      if (resource instanceof Entity) {
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

      if (resource instanceof Entity) {
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
