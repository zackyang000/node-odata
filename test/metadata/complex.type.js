import 'should';
import request from 'supertest';
import { host, port, odata, assertSuccess } from '../support/setup';

describe('metadata.complex.type', () => {
  let httpServer, server, db;

  beforeEach(async function() {
    server = odata();
  
  });

  afterEach(() => {
    httpServer.close();
  });

  it('should return explizit defined custom type in json format', async function() {
    const jsonDocument = {
      $Version: '4.0',      
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
