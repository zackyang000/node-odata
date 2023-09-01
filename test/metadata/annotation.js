import 'should';
import request from 'supertest';
import { host, port, odata, assertSuccess } from '../support/setup';
import should from 'should';

describe('metadata.annotations', () => {
  let httpServer, server;

  beforeEach(async function () {
    server = odata();

  });

  afterEach(() => {
    httpServer.close();
  });

  it('should return json metadata with property annotation', async function () {
    const jsonDocument = {
      $Version: '4.0',
      readonly: {
        $Kind: "Term",
        $Type: "Edm.Boolean",
        $AppliesTo: [
          "Property"
        ],
      },
      book: {
        $Kind: "EntityType",
        $Key: ["id"],
        id: {
          $Type: 'Edm.String',
          $MaxLength: 24
        },
        author: {
          $Type: 'Edm.String',
          '@readonly': true
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
    const vocabulary = server.vocabulary();

    vocabulary.define('readonly', Boolean, ['Property']);

    server.entity('book', null, {
      $Key: ['id'],
      id: {
        $Type: 'Edm.String',
        $MaxLength: 24
      },
      author: {
        $Type: 'Edm.String',
        ...vocabulary.annotate('readonly', 'Property', true)
      }
    });

    httpServer = server.listen(port);
    const res = await request(host).get('/$metadata?$format=json');
    assertSuccess(res);
    res.body.should.deepEqual(jsonDocument);
  });

  it('should return xml metadata with property annotation', async function () {
    const xmlDocument =
      ` <edmx:Edmx xmlns:edmx="http://docs.oasis-open.org/odata/ns/edmx" Version="4.0">
      <edmx:DataServices>
        <Schema xmlns="http://docs.oasis-open.org/odata/ns/edm" Namespace="node.odata">
          <Term Name="readonly" Type="Edm.Boolean" AppliesTo="Property"/>
          <EntityType Name="book">
            <Key>
              <PropertyRef Name="id"/>
            </Key>
            <Property Name="id" Type="Edm.String" MaxLength="24"/>
            <Property Name="author" Type="Edm.String">
              <Annotation Term="readonly">
                <Boolean>true</Boolean>
              </Annotation>
            </Property>
          </EntityType>
          <EntityContainer Name="Container">
            <EntitySet Name="book" EntityType="node.odata.book"/>
          </EntityContainer>
        </Schema>
      </edmx:DataServices>
    </edmx:Edmx>`.replace(/\s*</g, '<').replace(/>\s*/g, '>');
    const vocabulary = server.vocabulary();

    vocabulary.define('readonly', Boolean, ['Property']);
    server.entity('book', null, {
      $Key: ['id'],
      id: {
        $Type: 'Edm.String',
        $MaxLength: 24
      },
      author: {
        $Type: 'Edm.String',
        ...vocabulary.annotate('readonly', 'Property', true)
      }
    });
    httpServer = server.listen(port);
    const res = await request(host).get('/$metadata').set('accept', 'application/xml');
    assertSuccess(res);
    res.text.should.equal(xmlDocument);
  });

  it('should fail for not defined property annotation', async function () {
    try {
      const vocabulary = server.vocabulary();
      vocabulary.annotate('unknown', 'Property', true);
      should.fail(false, true, 'No exception thrown');

    } catch (err) {
      err.message.should.equal(`Annotation with name 'unknown' is not defined`);
    }
  });

  it('should works with later annotations', async function () {
    const jsonDocument = {
      $Version: '4.0',
      readonly: {
        $Kind: "Term",
        $Type: "Edm.Boolean",
        $AppliesTo: [
          "Property"
        ],
      },
      book: {
        $Kind: "EntityType",
        $Key: ["id"],
        id: {
          $Type: 'Edm.String',
          $MaxLength: 24
        },
        author: {
          $Type: 'Edm.String',
          '@readonly': true
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
    const vocabulary = server.vocabulary();

    vocabulary.define('readonly', Boolean, ['Property']);

    const book = server.entity('book', null, {
      $Key: ['id'],
      id: {
        $Type: 'Edm.String',
        $MaxLength: 24
      },
      author: {
        $Type: 'Edm.String'
      }
    });

    book.annotateProperty('author', 'readonly', true);

    httpServer = server.listen(port);
    const res = await request(host).get('/$metadata?$format=json');
    assertSuccess(res);
    res.body.should.deepEqual(jsonDocument);
  });

  it('should works with action parameter annotations', async function () {
    const jsonDocument = {
      $Version: '4.0',
      readonly: {
        $Kind: "Term",
        $Type: "Edm.Boolean",
        $AppliesTo: [
          "Parameter"
        ],
      },
      'changePassword': {
        $Kind: 'Action',
        $Parameter: [{
          $Type: 'Edm.String',
          $Name: 'newPassword',
          '@readonly': true
        }, {
          $Type: 'Edm.String',
          $Name: 'repeat'
        }]
      },
      $EntityContainer: 'node.odata',
      ['node.odata']: {
        $Kind: 'EntityContainer',
        'changePassword-import': {
          $Action: 'node.odata.changePassword'
        }
      },
    };
    const vocabulary = server.vocabulary();

    vocabulary.define('readonly', Boolean, ['Parameter']);

    const action = server.action('changePassword',
      (req, res, next) => { }, {
      $Parameter: [{
        $Type: 'Edm.String',
        $Name: 'newPassword'
      }, {
        $Type: 'Edm.String',
        $Name: 'repeat'
      }]
    });

    action.annotateParameter('newPassword', 'readonly', true);

    httpServer = server.listen(port);
    const res = await request(host).get('/$metadata?$format=json');
    assertSuccess(res);
    res.body.should.deepEqual(jsonDocument);
  });

  it('should works with action parameter annotations in xml format', async function () {
    const xmlDocument =
    ` <edmx:Edmx xmlns:edmx="http://docs.oasis-open.org/odata/ns/edmx" Version="4.0">
    <edmx:DataServices>
      <Schema xmlns="http://docs.oasis-open.org/odata/ns/edm" Namespace="node.odata">
        <Term Name="readonly" Type="Edm.Boolean" AppliesTo="Parameter"/>
        <Action Name="changePassword">
          <Parameter Name="newPassword" Type="Edm.String">
            <Annotation Term="readonly">
              <Boolean>true</Boolean>
            </Annotation>
          </Parameter>
          <Parameter Name="repeat" Type="Edm.String"/>
        </Action>
        <EntityContainer Name="Container">
          <ActionImport Name="changePassword-import" Action="node.odata.changePassword"/>
        </EntityContainer>
      </Schema>
    </edmx:DataServices>
  </edmx:Edmx>`.replace(/\s*</g, '<').replace(/>\s*/g, '>');
    const vocabulary = server.vocabulary();

    vocabulary.define('readonly', Boolean, ['Parameter']);

    const action = server.action('changePassword',
      (req, res, next) => { }, {
      $Parameter: [{
        $Type: 'Edm.String',
        $Name: 'newPassword'
      }, {
        $Type: 'Edm.String',
        $Name: 'repeat'
      }]
    });

    action.annotateParameter('newPassword', 'readonly', true);

    httpServer = server.listen(port);
    const res = await request(host).get('/$metadata?$format=xml');
    assertSuccess(res);
    res.text.should.equal(xmlDocument);
  });
});
