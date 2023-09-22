import 'should';
import request from 'supertest';
import { host, port, odata, assertSuccess } from '../support/setup';
import mongoose from 'mongoose';

const Schema = mongoose.Schema;

describe('mongo.metadata.resource.complex', () => {
  let httpServer, server;

  before(() => {
    mongoose.set('overwriteModels', true);
  })

  beforeEach(async function () {
    server = odata();
  });

  afterEach(() => {
    httpServer.close();
  });

  it('should return json metadata for nested document array', async function () {
    const jsonDocument = {
      $Version: '4.0',
      "complex-modelp1Child1": {
        $Kind: 'ComplexType',
        id: {
          $Type: 'Edm.String',
          $MaxLength: 24,
          $Nullable: true
        },
        p2: {
          $Type: 'Edm.String',
          $Nullable: true
        }
      },
      'complex-model': {
        $Kind: "EntityType",
        $Key: ["id"],
        id: {
          $Type: 'Edm.String',
          $MaxLength: 24,
          $Nullable: true
        },
        p1: {
          $Type: 'node.odata.complex-modelp1Child1',
          $Collection: true,
          $Nullable: true
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
    const ComplexModelSchema = new Schema({
      p1: [{ // array of objects
        p2: String
      }]
    });

    const ComplexModel = mongoose.model('complex-model', ComplexModelSchema);
    server.mongoEntity('complex-model', ComplexModel);
    httpServer = server.listen(port);
    const res = await request(host).get('/$metadata?$format=json');
    assertSuccess(res);
    res.body.should.deepEqual(jsonDocument);
  });

  it('should return xml metadata for nested document array', async function () {
    const xmlDocument =
      ` <edmx:Edmx xmlns:edmx="http://docs.oasis-open.org/odata/ns/edmx" Version="4.0">
      <edmx:DataServices>
        <Schema xmlns="http://docs.oasis-open.org/odata/ns/edm" Namespace="node.odata">
          <ComplexType Name="complex-modelp1Child1">
            <Property Name="p2" Type="Edm.String" Nullable="true"/>
            <Property Name="id" Type="Edm.String" Nullable="true" MaxLength="24"/>
          </ComplexType>
          <EntityType Name="complex-model">
            <Key>
              <PropertyRef Name="id"/>
            </Key>
            <Property Name="p1" Type="Collection(node.odata.complex-modelp1Child1)" Nullable="true"/>
            <Property Name="id" Type="Edm.String" Nullable="true" MaxLength="24"/>
          </EntityType>
          <EntityContainer Name="Container">
            <EntitySet Name="complex-model" EntityType="node.odata.complex-model"/>
          </EntityContainer>
        </Schema>
      </edmx:DataServices>
    </edmx:Edmx>`.replace(/\s*</g, '<').replace(/>\s*/g, '>');
    const ComplexModelSchema = new Schema({
      p1: [{ // array of objects
        p2: String
      }]
    });

    const ComplexModel = mongoose.model('complex-model', ComplexModelSchema);
    server.mongoEntity('complex-model', ComplexModel);
    httpServer = server.listen(port);
    const res = await request(host).get('/$metadata').set('accept', 'application/xml');
    assertSuccess(res);
    res.text.should.equal(xmlDocument);
  });

  it('should return json metadata for nested array', async function () {
    const jsonDocument = {
      $Version: '4.0',
      'complex-model': {
        $Kind: "EntityType",
        $Key: ["id"],
        id: {
          $Type: 'Edm.String',
          $MaxLength: 24,
          $Nullable: true
        },
        p3: {
          $Type: 'Edm.String',
          $Collection: true,
          $Nullable: true
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
    const ComplexModelSchema = new Schema({
      p3: [String] // array of primitive type
    });

    const ComplexModel = mongoose.model('complex-model', ComplexModelSchema);
    server.mongoEntity('complex-model', ComplexModel);
    httpServer = server.listen(port);
    const res = await request(host).get('/$metadata?$format=json').set('accept', 'application/json');
    res.statusCode.should.equal(200);
    res.body.should.deepEqual(jsonDocument);
  });

  it('should return xml metadata for nested array', async function () {
    const xmlDocument =
      ` <edmx:Edmx xmlns:edmx="http://docs.oasis-open.org/odata/ns/edmx" Version="4.0">
      <edmx:DataServices>
        <Schema xmlns="http://docs.oasis-open.org/odata/ns/edm" Namespace="node.odata">
          <EntityType Name="complex-model">
            <Key>
              <PropertyRef Name="id"/>
            </Key>
            <Property Name="p3" Type="Collection(Edm.String)" Nullable="true"/>
            <Property Name="id" Type="Edm.String" Nullable="true" MaxLength="24"/>
          </EntityType>
          <EntityContainer Name="Container">
            <EntitySet Name="complex-model" EntityType="node.odata.complex-model"/>
          </EntityContainer>
        </Schema>
      </edmx:DataServices>
    </edmx:Edmx>`.replace(/\s*</g, '<').replace(/>\s*/g, '>');
    const ComplexModelSchema = new Schema({
      p3: [String] // array of primitive type
    });

    const ComplexModel = mongoose.model('complex-model', ComplexModelSchema);
    server.mongoEntity('complex-model', ComplexModel);
    httpServer = server.listen(port);
    const res = await request(host).get('/$metadata').set('accept', 'application/xml');
    assertSuccess(res);
    res.text.should.equal(xmlDocument);
  });


  it('should return xml metadata for nested enum array', async function () {
    const xmlDocument =
      ` <edmx:Edmx xmlns:edmx="http://docs.oasis-open.org/odata/ns/edmx" Version="4.0">
      <edmx:DataServices>
        <Schema xmlns="http://docs.oasis-open.org/odata/ns/edm" Namespace="node.odata">
          <EntityType Name="complex-model">
            <Key>
              <PropertyRef Name="id"/>
            </Key>
            <Property Name="p3" Type="Collection(Edm.String)" Nullable="true"/>
            <Property Name="id" Type="Edm.String" Nullable="true" MaxLength="24"/>
          </EntityType>
          <EntityContainer Name="Container">
            <EntitySet Name="complex-model" EntityType="node.odata.complex-model"/>
          </EntityContainer>
        </Schema>
      </edmx:DataServices>
    </edmx:Edmx>`.replace(/\s*</g, '<').replace(/>\s*/g, '>');
    const ComplexModelSchema = new Schema({
      p3: [{
        type: String,
        enum: ['P4']
      }]
    });

    const ComplexModel = mongoose.model('complex-model', ComplexModelSchema);
    server.mongoEntity('complex-model', ComplexModel);
    httpServer = server.listen(port);
    const res = await request(host).get('/$metadata').set('accept', 'application/xml');
    assertSuccess(res);
    res.text.should.equal(xmlDocument);
  });


  it('should return json metadata for nested document in document', async function () {
    const jsonDocument = {
      $Version: '4.0',
      "complex-modelp4Child1": {
        $Kind: 'ComplexType',
        p5: {
          $Type: 'Edm.String',
          $Nullable: true
        }
      },
      'complex-model': {
        $Kind: "EntityType",
        $Key: ["id"],
        id: {
          $Type: 'Edm.String',
          $MaxLength: 24,
          $Nullable: true
        },
        p4: {
          $Type: 'node.odata.complex-modelp4Child1'
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
    const ComplexModelSchema = new Schema({
      p4: {
        p5: String
      }
    });

    const ComplexModel = mongoose.model('complex-model', ComplexModelSchema);
    server.mongoEntity('complex-model', ComplexModel);
    httpServer = server.listen(port);
    const res = await request(host).get('/$metadata?$format=json');
    res.statusCode.should.equal(200);
    res.body.should.deepEqual(jsonDocument);
  });

  it('should return xml metadata for nested document in document', async function () {
    const xmlDocument =
      ` <edmx:Edmx xmlns:edmx="http://docs.oasis-open.org/odata/ns/edmx" Version="4.0">
      <edmx:DataServices>
        <Schema xmlns="http://docs.oasis-open.org/odata/ns/edm" Namespace="node.odata">
          <ComplexType Name="complex-modelp4Child1">
            <Property Name="p5" Type="Edm.String" Nullable="true"/>
          </ComplexType>
          <EntityType Name="complex-model">
            <Key>
              <PropertyRef Name="id"/>
            </Key>
            <Property Name="id" Type="Edm.String" Nullable="true" MaxLength="24"/>
            <Property Name="p4" Type="node.odata.complex-modelp4Child1"/>
          </EntityType>
          <EntityContainer Name="Container">
            <EntitySet Name="complex-model" EntityType="node.odata.complex-model"/>
          </EntityContainer>
        </Schema>
      </edmx:DataServices>
    </edmx:Edmx>`.replace(/\s*</g, '<').replace(/>\s*/g, '>');
    const ComplexModelSchema = new Schema({
      p4: {
        p5: String
      }
    });

    const ComplexModel = mongoose.model('complex-model', ComplexModelSchema);
    server.mongoEntity('complex-model', ComplexModel);
    httpServer = server.listen(port);
    const res = await request(host).get('/$metadata');
    assertSuccess(res);
    res.text.should.equal(xmlDocument);
  });

  it('should return json metadata for nested document in array', async function () {
    const jsonDocument = {
      $Version: '4.0',
      p1p2Child1: {
        $Kind: "ComplexType",
        p3: {
          $Type: 'Edm.String',
          $Nullable: true
        },
        p4: {
          $Type: "node.odata.p1p4Child2"
        },
        id: {
          $Type: 'Edm.String',
          $MaxLength: 24,
          $Nullable: true
        }
      },
      p1p4Child2: {
        $Kind: "ComplexType",
        p5: {
          $Type: 'Edm.String',
          $Nullable: true
        }
      },
      p1: {
        $Kind: "EntityType",
        $Key: ["id"],
        id: {
          $Type: 'Edm.String',
          $MaxLength: 24,
          $Nullable: true
        },
        p2: {
          $Type: 'node.odata.p1p2Child1',
          $Collection: true,
          $Nullable: true
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
    const ComplexModelSchema = new Schema({
      p2: [{
        p3: String,
        p4: {
          p5: String
        }
      }]
    });

    const ComplexModel = mongoose.model('p1', ComplexModelSchema);
    server.mongoEntity('p1', ComplexModel);
    httpServer = server.listen(port);
    const res = await request(host).get('/$metadata?$format=json');
    res.statusCode.should.equal(200);
    res.body.should.deepEqual(jsonDocument);
  });

  it('should return xml metadata for nested document in document', async function () {
    const xmlDocument =
      ` <edmx:Edmx xmlns:edmx="http://docs.oasis-open.org/odata/ns/edmx" Version="4.0">
      <edmx:DataServices>
        <Schema xmlns="http://docs.oasis-open.org/odata/ns/edm" Namespace="node.odata">
          <ComplexType Name="p1p4Child2">
            <Property Name="p5" Type="Edm.String" Nullable="true"/>
          </ComplexType>
          <ComplexType Name="p1p2Child1">
            <Property Name="p3" Type="Edm.String" Nullable="true"/>
            <Property Name="id" Type="Edm.String" Nullable="true" MaxLength="24"/>
            <Property Name="p4" Type="node.odata.p1p4Child2"/>
          </ComplexType>
          <EntityType Name="p1">
            <Key>
              <PropertyRef Name="id"/>
            </Key>
            <Property Name="p2" Type="Collection(node.odata.p1p2Child1)" Nullable="true"/>
            <Property Name="id" Type="Edm.String" Nullable="true" MaxLength="24"/>
          </EntityType>
          <EntityContainer Name="Container">
            <EntitySet Name="p1" EntityType="node.odata.p1"/>
          </EntityContainer>
        </Schema>
      </edmx:DataServices>
    </edmx:Edmx>`.replace(/\s*</g, '<').replace(/>\s*/g, '>');
    const ComplexModelSchema = new Schema({
      p2: [{
        p3: String,
        p4: {
          p5: String
        }
      }]
    });

    const ComplexModel = mongoose.model('p1', ComplexModelSchema);
    server.mongoEntity('p1', ComplexModel);
    httpServer = server.listen(port);
    const res = await request(host).get('/$metadata');
    assertSuccess(res);
    res.text.should.equal(xmlDocument);
  });

  it('should use mapping if given', async function () {
    const jsonDocument = {
      $Version: '4.0',
      myComlexType: {
        $Kind: "ComplexType",
        id: {
          $Type: 'Edm.String',
          $MaxLength: 24,
          $Nullable: true
        },
        p3: {
          $Type: 'Edm.String'
        }
      },
      p1: {
        $Kind: "EntityType",
        $Key: ["id"],
        id: {
          $Type: 'Edm.String',
          $MaxLength: 24,
          $Nullable: true
        },
        p2: {
          $Type: 'node.odata.myComlexType'
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
    const ComplexModelSchema = new Schema({
      p2: {
        p3: String
      }
    });

    const ComplexModel = mongoose.model('p1', ComplexModelSchema);
    server.complexType('myComlexType', {
      id: {
        $Type: 'Edm.String',
        $MaxLength: 24,
        $Nullable: true
      },
      p3: {
        $Type: 'Edm.String'
      }
    });
    server.mongoEntity('p1', ComplexModel, undefined, undefined, undefined, {
      p2: {
        target: 'p2',
        attributes: {
          $Type: 'node.odata.myComlexType'
        }
      }
    });
    httpServer = server.listen(port);
    const res = await request(host).get('/$metadata?$format=json');
    res.statusCode.should.equal(200);
    res.body.should.deepEqual(jsonDocument);
  });
});
