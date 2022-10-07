import { Router } from 'express';
import pipes from '../pipes';
import Resource from '../ODataResource';

export default class Metadata {
  constructor(server) {
    this._server = server;
    this._hooks = {
    };
    this._count = 0;
  }

  get() {
    return this;
  }

  before(fn) {
    this._hooks.before = fn;
    return this;
  }

  after(fn) {
    this._hooks.after = fn;
    return this;
  }

  auth(fn) {
    this._hooks.auth = fn;
    return this;
  }

  _router() {
    /*eslint-disable */
    const router = Router();
    /*eslint-enable */
    router.get('/\\$metadata', (req, res) => {
      pipes.authorizePipe(req, res, this._hooks.auth)
        .then(() => pipes.beforePipe(req, res, this._hooks.before))
        .then(() => this.ctrl(req))
        .then(result => pipes.respondPipe(req, res, result || {}))
        .then(data => pipes.afterPipe(req, res, this._hooks.after, data))
        .catch(err => pipes.errorPipe(req, res, err));
    });

    return router;
  }

  visitProperty(node, root) {
    const result = {};

    switch (node.instance) {
      case 'ObjectId':
        result.$Type = 'self.ObjectId';
        break;

      case 'Number':
        result.$Type = 'Edm.Double';
        break;

      case 'Date':
        result.$Type = 'Edm.DateTimeOffset';
        break;

      case 'String':
        result.$Type = 'Edm.String';
        break;

      case 'Array': // node.path = p1; node.schema.paths
        result.$Collection = true;
        if (node.schema && node.schema.paths) {
          this._count += 1;
          const notClassifiedName = `${node.path}Child${this._count}`;
          // Array of complex type
          result.$Type = `self.${notClassifiedName}`;
          root(notClassifiedName, this.visitor('ComplexType', node.schema.paths, root));
        } else {
          const arrayItemType = this.visitor('Property', { instance: node.options.type[0].name }, root);

          result.$Type = arrayItemType.$Type;
        }
        break;

      default:
        return null;
    }

    return result;
  }

  visitEntityType(node, root) {
    const properties = Object.keys(node)
      .filter(path => path !== '_id')
      .reduce((previousProperty, curentProperty) => {
        const result = {
          ...previousProperty,
          [curentProperty]: this.visitor('Property', node[curentProperty], root),
        };

        return result;
      }, {});

    return {
      $Kind: 'EntityType',
      $Key: ['id'],
      id: {
        $Type: 'self.ObjectId',
        $Nullable: false,
      },
      ...properties,
    };
  }

  visitComplexType(node, root) {
    const properties = Object.keys(node)
      .filter(item => item !== '_id')
      .reduce((previousProperty, curentProperty) => {
        const result = {
          ...previousProperty,
          [curentProperty]: this.visitor('Property', node[curentProperty], root),
        };

        return result;
      }, {});

    return {
      $Kind: 'ComplexType',
      ...properties,
    };
  }

  static visitAction(node) {
    return {
      $Kind: 'Action',
      $IsBound: true,
      $Parameter: [{
        $Name: node.resource,
        $Type: `self.${node.resource}`,
        $Collection: node.binding === 'collection' ? true : undefined,
      }],
    };
  }

  static visitFunction(node) {
    return {
      $Kind: 'Function',
      ...node.params,
    };
  }

  visitor(type, node, root) {
    switch (type) {
      case 'Property':
        return this.visitProperty(node, root);

      case 'ComplexType':
        return this.visitComplexType(node, root);

      case 'Action':
        return Metadata.visitAction(node);

      case 'Function':
        return Metadata.visitFunction(node, root);

      default:
        return this.visitEntityType(node, root);
    }
  }

  ctrl() {
    const entityTypes = Object.keys(this._server.resources).reduce(
      (previousResource, currentResource) => {
        const resource = this._server.resources[currentResource];
        const result = { ...previousResource };
        const attachToRoot = (name, value) => { result[name] = value; };

        if (resource instanceof Resource) {
          const paths = resource.model.model.schema.paths;

          result[currentResource] = this.visitor('EntityType', paths, attachToRoot);
          const actions = Object.keys(resource.actions);
          if (actions && actions.length) {
            actions.forEach((action) => {
              result[action] = this.visitor('Action', resource.actions[action], attachToRoot);
            });
          }
        } else {
          result[currentResource] = this.visitor('Function', resource, attachToRoot);
        }

        return result;
      }, {});

    const entitySets = Object.keys(this._server.resources).reduce(
      (previousResource, currentResource) => {
        const result = { ...previousResource };
        result[currentResource] = this._server.resources[currentResource] instanceof Resource ? {
          $Collection: true,
          $Type: `self.${currentResource}`,
        } : {
          $Function: `self.${currentResource}`,
        };

        return result;
      }, {});

    const document = {
      $Version: '4.0',
      ObjectId: {
        $Kind: 'TypeDefinition',
        $UnderlyingType: 'Edm.String',
        $MaxLength: 24,
      },
      ...entityTypes,
      $EntityContainer: 'org.example.DemoService',
      ['org.example.DemoService']: { // eslint-disable-line no-useless-computed-key
        $Kind: 'EntityContainer',
        ...entitySets,
      },
    };

    return new Promise(resolve => resolve({
      status: 200,
      metadata: document,
    }));
  }

}
