// For issue: https://github.com/TossShinHwa/node-odata/issues/96
// For issue: https://github.com/TossShinHwa/node-odata/issues/25

import 'should';
import request from 'supertest';
import { host, port, odata, assertSuccess } from '../support/setup';

describe('metadata.custom.resource', () => {
  let httpServer, server;

  beforeEach(async function() {
    server = odata();
  
  });

  afterEach(() => {
    httpServer.close();
  });


  it('should return json metadata for custom resource', async function() {
    const jsonDocument = {
      $Version: '4.0',
      ObjectId: {
        $Kind: "TypeDefinition",
        $UnderlyingType: "Edm.String",
        $MaxLength: 24
      },
      book: {
        $Kind: "EntityType",
        $Key: ["id"],
        id: {
          $Type: "node.odata.ObjectId",
          $Nullable: false,
        },
        salted: {
          $Type: 'Edm.Boolean'
        }
      },
      $EntityContainer: 'node.odata',
      ['node.odata']: {
        $Kind: 'EntityContainer',
        book: {
          $Collection: true,
          $Type: `node.odata.book`,
        }
      },
    };
    server.entity('book', {}, {
      $Key: ["id"],
      id: {
        $Type: "node.odata.ObjectId",
        $Nullable: false,
      },
      salted: {
        $Type: 'Edm.Boolean'
      }
    });
    httpServer = server.listen(port);
    const res = await request(host).get('/$metadata?$format=json');
    assertSuccess(res);
    res.body.should.deepEqual(jsonDocument);
  });

});
