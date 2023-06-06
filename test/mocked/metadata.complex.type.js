// For issue: https://github.com/TossShinHwa/node-odata/issues/96
// For issue: https://github.com/TossShinHwa/node-odata/issues/25

import 'should';
import request from 'supertest';
import { host, conn, port, odata, assertSuccess } from '../support/setup';
import FakeDb from '../support/fake-db';

describe('metadata.complex.type', () => {
  let httpServer, server, db;

  beforeEach(async function() {
    db = new FakeDb();
    server = odata(db);
  
  });

  afterEach(() => {
    httpServer.close();
  });

  it('should return explizit defined custom type in json format', async function() {
    const jsonDocument = {
      $Version: '4.0',      
      ObjectId: {
        $Kind: 'TypeDefinition',
        $UnderlyingType: 'Edm.String',
        $MaxLength: 24,
      },
      fullName: {
        $Kind: "ComplexType",
        first: {
          $Type: "Edm.String"
        },
        last: {
          $Type: 'Edm.String'
        }
      },
      $EntityContainer: 'node.odata',
      ['node.odata']: {
        $Kind: 'EntityContainer'
      },
    };
    server.complexType('fullName', {
      first: {
        $Type: 'Edm.String'
      },
      last: {
        $Type: 'Edm.String'
      }
    });
    httpServer = server.listen(port);
    const res = await request(host).get('/$metadata?$format=json');
    assertSuccess(res);
    res.body.should.deepEqual(jsonDocument);
  });

  it('should return explizit defined custom type in xml format', async function() {
    const xmlDocument = 
  ` <edmx:Edmx xmlns:edmx="http://docs.oasis-open.org/odata/ns/edmx" Version="4.0">
      <edmx:DataServices>
        <Schema xmlns="http://docs.oasis-open.org/odata/ns/edm" Namespace="node.odata">
          <TypeDefinition Name="ObjectId" UnderlyingType="Edm.String" MaxLength="24"></TypeDefinition>
          <ComplexType Name="fullName">
            <Property Name="first" Type="Edm.String"/>
            <Property Name="last" Type="Edm.String"/>
          </ComplexType>
          <EntityContainer Name="Container">
          </EntityContainer>
        </Schema>
      </edmx:DataServices>
    </edmx:Edmx>`.replace(/\s*</g, '<').replace(/>\s*/g, '>');
    server.complexType('fullName', {
      first: {
        $Type: 'Edm.String'
      },
      last: {
        $Type: 'Edm.String'
      }
    });
    httpServer = server.listen(port);
    const res = await request(host).get('/$metadata');
    assertSuccess(res);
    res.text.should.equal(xmlDocument);
  });


});
