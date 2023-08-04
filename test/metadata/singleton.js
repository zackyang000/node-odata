import 'should';
import request from 'supertest';
import { host, port, odata, assertSuccess } from '../support/setup';
import { BookMetadata } from '../support/books.model';

describe('metadata.custom.resource', () => {
  let httpServer, server;

  beforeEach(async function() {
    server = odata();
  
  });

  afterEach(() => {
    httpServer.close();
  });

  it('[json] should render entity type if only singleton defined', async function() {
    const jsonDocument = {
      $Version: '4.0',
      ObjectId: {
        $Kind: "TypeDefinition",
        $UnderlyingType: "Edm.String",
        $MaxLength: 24
      },
      book: {
        $Kind: "EntityType",
        ...BookMetadata
      },
      $EntityContainer: 'node.odata',
      ['node.odata']: {
        $Kind: 'EntityContainer',
        book: {
          $Type: `node.odata.book`
        }
      },
    };
    server.singleton('book', {}, BookMetadata);
    httpServer = server.listen(port);
    const res = await request(host).get('/$metadata?$format=json');
    assertSuccess(res);
    res.body.should.deepEqual(jsonDocument);
  });

  it('[xml] should render entity type if only singleton defined', async function() {
    const xmlDocument =
    ` <edmx:Edmx xmlns:edmx="http://docs.oasis-open.org/odata/ns/edmx" Version="4.0">
      <edmx:DataServices>
        <Schema xmlns="http://docs.oasis-open.org/odata/ns/edm" Namespace="node.odata">
          <TypeDefinition Name="ObjectId" UnderlyingType="Edm.String" MaxLength="24">
          </TypeDefinition>
          <EntityType Name="book">
            <Key>
              <PropertyRef Name="id"/>
            </Key>
            <Property Name="id" Type="node.odata.ObjectId"/>
            <Property Name="author" Type="Edm.String"/>
            <Property Name="genre" Type="Edm.String"/>
            <Property Name="price" Type="Edm.Double"/>
            <Property Name="publish_date" Type="Edm.DateTimeOffset"/>
            <Property Name="title" Type="Edm.String"/>
            <Property Name="createdAt" Type="Edm.DateTimeOffset"/>
            <Property Name="updatedAt" Type="Edm.DateTimeOffset"/>
          </EntityType>
          <EntityContainer Name="Container">
            <Singleton Name="book" Type="node.odata.book"/>
          </EntityContainer>
        </Schema>
      </edmx:DataServices>
    </edmx:Edmx>`.replace(/\s*</g, '<').replace(/>\s*/g, '>');

    server.singleton('book', {}, BookMetadata);
    httpServer = server.listen(port);
    const res = await request(host).get('/$metadata');
    assertSuccess(res);
    res.text.should.equal(xmlDocument);
  });
});
