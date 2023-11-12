import 'should';
import request from 'supertest';
import { host, port, odata, assertSuccess } from '../support/setup';

describe('metadata.format', () => {
  let httpServer, server;

  const metadata = {
    $Key: ["id"],
    id: {
      $Type: 'Edm.String',
      $MaxLength: 24
    },
    author: {
      $Type: 'Edm.String'
    },
    description: {
      $Type: 'Edm.String'
    },
    genre: {
      $Type: 'Edm.String'
    },
    price: {
      $Type: 'Edm.Double'
    },
    publish_date: {
      $Type: 'Edm.DateTimeOffset'
    },
    title: {
      $Type: 'Edm.String'
    }
  };
  const jsonDocument = {
    $Version: '4.0',
    book: {
      $Kind: "EntityType",
      ...metadata
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
  const xmlDocument =
    ` <edmx:Edmx xmlns:edmx="http://docs.oasis-open.org/odata/ns/edmx" Version="4.0">
      <edmx:DataServices>
        <Schema xmlns="http://docs.oasis-open.org/odata/ns/edm" Namespace="node.odata">
          <EntityType Name="book">
            <Key>
              <PropertyRef Name="id"/>
            </Key>
            <Property Name="id" Type="Edm.String" MaxLength="24"/>
            <Property Name="author" Type="Edm.String"/>
            <Property Name="description" Type="Edm.String"/>
            <Property Name="genre" Type="Edm.String"/>
            <Property Name="price" Type="Edm.Double"/>
            <Property Name="publish_date" Type="Edm.DateTimeOffset"/>
            <Property Name="title" Type="Edm.String"/>
          </EntityType>
          <EntityContainer Name="Container">
            <EntitySet Name="book" EntityType="node.odata.book"/>
          </EntityContainer>
        </Schema>
      </edmx:DataServices>
    </edmx:Edmx>`.replace(/\s*</g, '<').replace(/>\s*/g, '>');

  beforeEach(async function () {
    server = odata();
    server.entity('book', null, metadata);

  });

  afterEach(() => {
    httpServer.close();
  });

  it('should return json according accept header', async function () {
    httpServer = server.listen(port);
    const res = await request(host).get('/$metadata').set('accept', 'application/json');
    assertSuccess(res);
    checkContentType(res, 'application/json');
    res.body.should.deepEqual(jsonDocument);
  });

  it('should return json if $format overrides accept header', async function () {
    httpServer = server.listen(port);
    const res = await request(host).get('/$metadata?$format=json').set('accept', 'application/xml');
    res.statusCode.should.equal(200);
    checkContentType(res, 'application/json');
    res.body.should.deepEqual(jsonDocument);
  });

  it('should return xml if xml has highest quality value', async function () {
    httpServer = server.listen(port);
    const res = await request(host).get('/$metadata').set('accept', 'application/json;q=0.9, application/xml');
    res.statusCode.should.equal(200);
    checkContentType(res, 'application/xml');
    res.text.should.equal(xmlDocument);
  });

  it('should return xml if xml and json matched with asterix', async function () {
    httpServer = server.listen(port);
    const res = await request(host).get('/$metadata').set('accept', '*/*');
    res.statusCode.should.equal(200);
    checkContentType(res, 'application/xml');
    res.text.should.equal(xmlDocument);
  });
});


function checkContentType(res, value) {
  res.header.should.have.property('content-type');
  res.header['content-type'].should.containEql(value);
}