import { Router } from 'express';
import pipes from '../pipes';

export default class {
  constructor(server) {
    this._server = server;
    this._hooks = {
    };
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

  mapPrimititveType(type) {
    switch (type) {
      case 'ObjectId':
        return 'self.ObjectId';

      case 'Number':
        return 'Edm.Double';

      case 'Date':
        return 'Edm.DateTimeOffset';

      default:
        return 'Edm.String';
    }
  }

  ctrl() {
    const entityTypes = Object.keys(this._server.resources).reduce(
      (previousResource, currentResource) => {
        const schema = this._server.resources[currentResource].model.schema;
        const properties = Object.keys(schema).reduce(
          (previousProperty, curentProperty) => {
            previousProperty[curentProperty] = {
              $Type: this.mapPrimititveType(schema[curentProperty]),
            };
          }, {});

        previousResource[currentResource] = {
          $Kind: "EntityType",
          $Key: ["id"],
          id: {
            $Type: "self.ObjectId",
            $Nullable: false,
          },
          ...properties
        };
      }, {});

    const entitySets = Object.keys(this._server.resources).reduce(
      (previousResource, currentResource) => {
        previousResource[currentResource] = {
          $Collection: true,
          $Type: `self.${currentResource}`,
        };
      }, {});

    const document = {
      $Version: '4.0',
      ObjectId: {
        $Kind: "TypeDefinition",
        $UnderlyingType: "Edm.String",
        $MaxLength: 24
      },
      ...entityTypes,
      $EntityContainer: 'org.example.DemoService',
      ['org.example.DemoService']: {
        $Kind: 'EntityContainer',
        ...entitySets
      },
    };

    return new Promise(resolve => resolve({
      status: 200,
      metadata: document,
    }));
  }

}
