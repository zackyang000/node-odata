// For issue: https://github.com/TossShinHwa/node-odata/issues/96
// For issue: https://github.com/TossShinHwa/node-odata/issues/25

import 'should';
import request from 'supertest';
import { host, port, odata, assertSuccess } from './support/setup';

describe('metadata.function', () => {
  let httpServer, server;

  beforeEach(async function() {
    server = odata();

  });

  afterEach(() => {
    httpServer.close();
  });

  it('should return json metadata for function', async function() {
    const jsonDocument = {
      $Version: '4.0',
      ObjectId: {
        $Kind: "TypeDefinition",
        $UnderlyingType: "Edm.String",
        $MaxLength: 24
      },
      'odata-function': {
        $Kind: 'Function',
        $ReturnType: {
          $Type: 'Edm.String'
        }
      },
      $EntityContainer: 'node.odata',
      ['node.odata']: {
        $Kind: 'EntityContainer',
        'odata-function': {
          $Function: 'node.odata.odata-function'
        }
      },
    };
    server.function('/odata-function', 
      () => {},
      { 
        $ReturnType: {
        $Type: 'Edm.String'
      }});
    httpServer = server.listen(port);
    const res = await request(host).get('/$metadata?$format=json');
    assertSuccess(res);
    res.body.should.deepEqual(jsonDocument);
  });

  it('should return xml metadata for function', async function() {
    const xmlDocument = 
  ` <edmx:Edmx xmlns:edmx="http://docs.oasis-open.org/odata/ns/edmx" Version="4.0">
      <edmx:DataServices>
        <Schema xmlns="http://docs.oasis-open.org/odata/ns/edm" Namespace="node.odata">
          <TypeDefinition Name="ObjectId" UnderlyingType="Edm.String" MaxLength="24">
          </TypeDefinition>
          <Function Name="odata-function">
            <ReturnType Type="Edm.String"/>
          </Function>
          <EntityContainer Name="Container">
            <FunctionImport Name="odata-function" Function="node.odata.odata-function"/>
          </EntityContainer>
        </Schema>
      </edmx:DataServices>
    </edmx:Edmx>`.replace(/\s*</g, '<').replace(/>\s*/g, '>');
    server.function('odata-function', 
      (req, res, next) => {},
      { $ReturnType: {
        $Type: 'Edm.String'
      }});
    httpServer = server.listen(port);
    const res = await request(host).get('/$metadata');
    assertSuccess(res);
    res.text.should.equal(xmlDocument);
  });
});
