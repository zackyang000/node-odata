// For issue: https://github.com/TossShinHwa/node-odata/issues/96
// For issue: https://github.com/TossShinHwa/node-odata/issues/25

import 'should';
import request from 'supertest';
import { host, conn, port, odata, assertSuccess } from '../support/setup';
import FakeDb from '../support/fake-db';

describe('metadata.resource.complex', () => {
  let httpServer, server, db;

  beforeEach(async function() {
    db = new FakeDb();
    server = odata(db);
  });

  afterEach(() => {
    httpServer.close();
  });

  it('should return json metadata for nested document array', async function() {
    const jsonDocument = {
      $Version: '4.0',
      ObjectId: {
        $Kind: "TypeDefinition",
        $UnderlyingType: "Edm.String",
        $MaxLength: 24
      },
      p1Child1: {
        $Kind: 'ComplexType',
        p2: {
          $Type: 'Edm.String'
        }
      },
      'complex-model': {
        $Kind: "EntityType",
        $Key: ["id"],
        id: {
          $Type: "node.odata.ObjectId",
          $Nullable: false,
        },
        p1: {
          $Type: 'node.odata.p1Child1',
          $Collection: true
        }
      },
      $EntityContainer: 'node.odata',
      ['node.odata']: {
        $Kind: 'EntityContainer',
        'complex-model': {
          $Collection: true,
          $Type: `node.odata.complex-model`,
        }
      },
    };
    server.resource('complex-model', { 
      p1: [{ // array of objects
        p2: String 
      }]
    });
    httpServer = server.listen(port);
    const res = await request(host).get('/$metadata?$format=json');
    assertSuccess(res);
    res.body.should.deepEqual(jsonDocument);
  });

  it('should return xml metadata for nested document array', async function() {
    const xmlDocument = 
  ` <edmx:Edmx xmlns:edmx="http://docs.oasis-open.org/odata/ns/edmx" Version="4.0">
      <edmx:DataServices>
        <Schema xmlns="http://docs.oasis-open.org/odata/ns/edm" Namespace="node.odata">
          <TypeDefinition Name="ObjectId" UnderlyingType="Edm.String" MaxLength="24">
          </TypeDefinition>
          <ComplexType Name="p1Child1">
            <Property Name="p2" Type="Edm.String"/>
          </ComplexType>
          <EntityType Name="complex-model">
            <Key>
              <PropertyRef Name="id"/>
            </Key>
            <Property Name="id" Type="node.odata.ObjectId" Nullable="false"/>
            <Property Name="p1" Type="node.odata.p1Child1" Collection="true"/>
          </EntityType>
          <EntityContainer Name="Container">
            <EntitySet Name="complex-model" EntityType="node.odata.complex-model"/>
          </EntityContainer>
        </Schema>
      </edmx:DataServices>
    </edmx:Edmx>`.replace(/\s*</g, '<').replace(/>\s*/g, '>');
    server.resource('complex-model', { 
      p1: [{ // array of objects
        p2: String 
      }]
    });
    httpServer = server.listen(port);
    const res = await request(host).get('/$metadata').set('accept', 'application/xml');
    assertSuccess(res);
    res.text.should.equal(xmlDocument);
  });

  it('should return json metadata for nested array', async function() {
    const jsonDocument = {
      $Version: '4.0',
      ObjectId: {
        $Kind: "TypeDefinition",
        $UnderlyingType: "Edm.String",
        $MaxLength: 24
      },
      'complex-model': {
        $Kind: "EntityType",
        $Key: ["id"],
        id: {
          $Type: "node.odata.ObjectId",
          $Nullable: false,
        },
        p3: {
          $Type: 'Edm.String',
          $Collection: true
        }
      },
      $EntityContainer: 'node.odata',
      ['node.odata']: {
        $Kind: 'EntityContainer',
        'complex-model': {
          $Collection: true,
          $Type: `node.odata.complex-model`,
        }
      },
    };
    server.resource('complex-model', { 
      p3: [String], // array of primitive type
    });
    httpServer = server.listen(port);
    const res = await request(host).get('/$metadata?$format=json').set('accept', 'application/json');
    res.statusCode.should.equal(200);
    res.body.should.deepEqual(jsonDocument);
  });

  it('should return xml metadata for nested array', async function() {
    const xmlDocument = 
  ` <edmx:Edmx xmlns:edmx="http://docs.oasis-open.org/odata/ns/edmx" Version="4.0">
      <edmx:DataServices>
        <Schema xmlns="http://docs.oasis-open.org/odata/ns/edm" Namespace="node.odata">
          <TypeDefinition Name="ObjectId" UnderlyingType="Edm.String" MaxLength="24">
          </TypeDefinition>
          <EntityType Name="complex-model">
            <Key>
              <PropertyRef Name="id"/>
            </Key>
            <Property Name="id" Type="node.odata.ObjectId" Nullable="false"/>
            <Property Name="p3" Type="Edm.String" Collection="true"/>
          </EntityType>
          <EntityContainer Name="Container">
            <EntitySet Name="complex-model" EntityType="node.odata.complex-model"/>
          </EntityContainer>
        </Schema>
      </edmx:DataServices>
    </edmx:Edmx>`.replace(/\s*</g, '<').replace(/>\s*/g, '>');
    server.resource('complex-model', { 
      p3: [String]
    });
    httpServer = server.listen(port);
    const res = await request(host).get('/$metadata').set('accept', 'application/xml');
    assertSuccess(res);
    res.text.should.equal(xmlDocument);
  });


  it('should return xml metadata for nested enum array', async function() {
    const xmlDocument = 
  ` <edmx:Edmx xmlns:edmx="http://docs.oasis-open.org/odata/ns/edmx" Version="4.0">
      <edmx:DataServices>
        <Schema xmlns="http://docs.oasis-open.org/odata/ns/edm" Namespace="node.odata">
          <TypeDefinition Name="ObjectId" UnderlyingType="Edm.String" MaxLength="24">
          </TypeDefinition>
          <EntityType Name="complex-model">
            <Key>
              <PropertyRef Name="id"/>
            </Key>
            <Property Name="id" Type="node.odata.ObjectId" Nullable="false"/>
            <Property Name="p3" Type="Edm.String" Collection="true"/>
          </EntityType>
          <EntityContainer Name="Container">
            <EntitySet Name="complex-model" EntityType="node.odata.complex-model"/>
          </EntityContainer>
        </Schema>
      </edmx:DataServices>
    </edmx:Edmx>`.replace(/\s*</g, '<').replace(/>\s*/g, '>');
    server.resource('complex-model', { 
      p3: [{
        type: String,
        enum: ['P4']
      }]
    });
    httpServer = server.listen(port);
    const res = await request(host).get('/$metadata').set('accept', 'application/xml');
    assertSuccess(res);
    res.text.should.equal(xmlDocument);
  });


  it('should return json metadata for nested document in document', async function() {
    const jsonDocument = {
      $Version: '4.0',
      ObjectId: {
        $Kind: "TypeDefinition",
        $UnderlyingType: "Edm.String",
        $MaxLength: 24
      },
      'complex-model': {
        $Kind: "EntityType",
        $Key: ["id"],
        id: {
          $Type: "node.odata.ObjectId",
          $Nullable: false,
        },
        'p4-p5': {
          $Type: 'Edm.String'
        }
      },
      $EntityContainer: 'node.odata',
      ['node.odata']: {
        $Kind: 'EntityContainer',
        'complex-model': {
          $Collection: true,
          $Type: `node.odata.complex-model`,
        }
      },
    };
    server.resource('complex-model', { 
      p4: {
        p5: String
      }
    });
    httpServer = server.listen(port);
    const res = await request(host).get('/$metadata?$format=json');
    res.statusCode.should.equal(200);
    res.body.should.deepEqual(jsonDocument);
  });

  it('should return xml metadata for nested document in document', async function() {
    const xmlDocument = 
  ` <edmx:Edmx xmlns:edmx="http://docs.oasis-open.org/odata/ns/edmx" Version="4.0">
      <edmx:DataServices>
        <Schema xmlns="http://docs.oasis-open.org/odata/ns/edm" Namespace="node.odata">
          <TypeDefinition Name="ObjectId" UnderlyingType="Edm.String" MaxLength="24">
          </TypeDefinition>
          <EntityType Name="complex-model">
            <Key>
              <PropertyRef Name="id"/>
            </Key>
            <Property Name="id" Type="node.odata.ObjectId" Nullable="false"/>
            <Property Name="p4-p5" Type="Edm.String"/>
          </EntityType>
          <EntityContainer Name="Container">
            <EntitySet Name="complex-model" EntityType="node.odata.complex-model"/>
          </EntityContainer>
        </Schema>
      </edmx:DataServices>
    </edmx:Edmx>`.replace(/\s*</g, '<').replace(/>\s*/g, '>');
    server.resource('complex-model', { 
      p4: {
        p5: String
      }
    });
    httpServer = server.listen(port);
    const res = await request(host).get('/$metadata');
    assertSuccess(res);
    res.text.should.equal(xmlDocument);
  });

  it('should return json metadata for nested document in array', async function() {
    const jsonDocument = {
      $Version: '4.0',
      ObjectId: {
        $Kind: "TypeDefinition",
        $UnderlyingType: "Edm.String",
        $MaxLength: 24
      },
      p2Child1: {
        $Kind: "ComplexType",
        p3: {
          $Type: 'Edm.String'
        },
        'p4-p5': {
          $Type: 'Edm.String'
        }
      },
      p1: {
        $Kind: "EntityType",
        $Key: ["id"],
        id: {
          $Type: "node.odata.ObjectId",
          $Nullable: false,
        },
        p2: {
          $Type: 'node.odata.p2Child1',
          $Collection: true
        }
      },
      $EntityContainer: 'node.odata',
      ['node.odata']: {
        $Kind: 'EntityContainer',
        p1: {
          $Collection: true,
          $Type: `node.odata.p1`,
        }
      },
    };
    server.resource('p1', { 
      p2: [{
        p3: String,
        p4: {
          p5: String
        }
      }]
    });
    httpServer = server.listen(port);
    const res = await request(host).get('/$metadata?$format=json');
    res.statusCode.should.equal(200);
    res.body.should.deepEqual(jsonDocument);
  });

  it('should return xml metadata for nested document in document', async function() {
    const xmlDocument = 
  ` <edmx:Edmx xmlns:edmx="http://docs.oasis-open.org/odata/ns/edmx" Version="4.0">
      <edmx:DataServices>
        <Schema xmlns="http://docs.oasis-open.org/odata/ns/edm" Namespace="node.odata">
          <TypeDefinition Name="ObjectId" UnderlyingType="Edm.String" MaxLength="24">
          </TypeDefinition>
          <ComplexType Name="p2Child1">
            <Property Name="p3" Type="Edm.String"/>
            <Property Name="p4-p5" Type="Edm.String"/>
          </ComplexType>
          <EntityType Name="p1">
            <Key>
              <PropertyRef Name="id"/>
            </Key>
            <Property Name="id" Type="node.odata.ObjectId" Nullable="false"/>
            <Property Name="p2" Type="node.odata.p2Child1" Collection="true"/>
          </EntityType>
          <EntityContainer Name="Container">
            <EntitySet Name="p1" EntityType="node.odata.p1"/>
          </EntityContainer>
        </Schema>
      </edmx:DataServices>
    </edmx:Edmx>`.replace(/\s*</g, '<').replace(/>\s*/g, '>');
    server.resource('p1', { 
      p2: [{
        p3: String,
        p4: {
          p5: String
        }
      }]
    });
    httpServer = server.listen(port);
    const res = await request(host).get('/$metadata');
    assertSuccess(res);
    res.text.should.equal(xmlDocument);
  });
});
