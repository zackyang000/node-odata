// For issue: https://github.com/TossShinHwa/node-odata/issues/96
// For issue: https://github.com/TossShinHwa/node-odata/issues/25

import 'should';
import request from 'supertest';
import { host, port, odata, assertSuccess } from '../support/setup';
import mongoose from 'mongoose';

const Schema = mongoose.Schema;

describe('metadata', () => {
  let httpServer, server;

  before(() => {
    mongoose.set('overwriteModels', true);
  })

  beforeEach(async function() {
    server = odata();
  
  });

  afterEach(() => {
    httpServer.close();
    debugger;
  });

  it('should return json metadata and ignore unknown attributes', async function() {
    const jsonDocument = {
      $Version: '4.0',
      book: {
        $Kind: "EntityType",
        $Key: ["id"],
        id: {
          $Type: 'Edm.String',
          $MaxLength: 24
        },
        price: {
          $Type: 'Edm.Double'
        },
        author: {
          $Type: 'Edm.String'
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
    const BookSchema = new Schema({
      price: {
        type: Number,
        min: 1,
        max: 300
      },
      author: {
        type: String,
        required: true,
        trim:true,
        unique: true,
        minLength: 2,
        match: [/[a-z]+/, 'It must containatleast one lowercase letter'],
        validate: [{
          validator: (value) => value.match(/[A-Z]+/),
          msg: 'It must contain at least one capital letter'
        }]
      }
    });
    
    const BookModel = mongoose.model('book', BookSchema);

    server.mongoEntity('book', BookModel);
    httpServer = server.listen(port);
    const res = await request(host).get('/$metadata?$format=json');
    assertSuccess(res);
    res.body.should.deepEqual(jsonDocument);
  });

  it('should return xml metadata and ignore unknown attributes', async function() {
    const xmlDocument = 
  ` <edmx:Edmx xmlns:edmx="http://docs.oasis-open.org/odata/ns/edmx" Version="4.0">
      <edmx:DataServices>
        <Schema xmlns="http://docs.oasis-open.org/odata/ns/edm" Namespace="node.odata">
          <EntityType Name="book">
            <Key>
              <PropertyRef Name="id"/>
            </Key>
            <Property Name="price" Type="Edm.Double"/>
            <Property Name="author" Type="Edm.String"/>
            <Property Name="id" Type="Edm.String" MaxLength="24"/>
          </EntityType>
          <EntityContainer Name="Container">
            <EntitySet Name="book" EntityType="node.odata.book"/>
          </EntityContainer>
        </Schema>
      </edmx:DataServices>
    </edmx:Edmx>`.replace(/\s*</g, '<').replace(/>\s*/g, '>');
    const BookSchema = new Schema({
      price: {
        type: Number,
        min: 1,
        max: 300
      },
      author: {
        type: String,
        required: true,
        minLength: 2,
        match: [/[a-z]+/, 'It must containatleast one lowercase letter'],
        validate: [{
          validator: (value) => value.match(/[A-Z]+/),
          msg: 'It must contain at least one capital letter'
        }]
      }
    });
    
    const BookModel = mongoose.model('book', BookSchema);

    server.mongoEntity('book', BookModel);
    httpServer = server.listen(port);
    const res = await request(host).get('/$metadata');
    assertSuccess(res);
    res.text.should.equal(xmlDocument);
  });

  it('should return json metadata with maxLength attribute', async function() {
    const jsonDocument = {
      $Version: '4.0',
      book: {
        $Kind: "EntityType",
        $Key: ["id"],
        id: {
          $Type: 'Edm.String',
          $MaxLength: 24
        },
        author: {
          $Type: 'Edm.String',
          $MaxLength: 25
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
    const BookSchema = new Schema({
      author: {
        type: String,
        maxLength: 25
      }
    });
    
    const BookModel = mongoose.model('book', BookSchema);

    server.mongoEntity('book', BookModel);
    httpServer = server.listen(port);
    const res = await request(host).get('/$metadata?$format=json');
    assertSuccess(res);
    res.body.should.deepEqual(jsonDocument);
  });

  it('should return xml metadata with maxLength attribute', async function() {
    const xmlDocument = 
  ` <edmx:Edmx xmlns:edmx="http://docs.oasis-open.org/odata/ns/edmx" Version="4.0">
      <edmx:DataServices>
        <Schema xmlns="http://docs.oasis-open.org/odata/ns/edm" Namespace="node.odata">
          <EntityType Name="book">
            <Key>
              <PropertyRef Name="id"/>
            </Key>
            <Property Name="author" Type="Edm.String" MaxLength="25"/>
            <Property Name="id" Type="Edm.String" MaxLength="24"/>
          </EntityType>
          <EntityContainer Name="Container">
            <EntitySet Name="book" EntityType="node.odata.book"/>
          </EntityContainer>
        </Schema>
      </edmx:DataServices>
    </edmx:Edmx>`.replace(/\s*</g, '<').replace(/>\s*/g, '>');
    const BookSchema = new Schema({
      author: {
        type: String,
        maxLength: 25
      }
    });
    
    const BookModel = mongoose.model('book', BookSchema);

    server.mongoEntity('book', BookModel);
    httpServer = server.listen(port);
    const res = await request(host).get('/$metadata');
    assertSuccess(res);
    res.text.should.equal(xmlDocument);
  });

  it('should return json metadata with default value attribute', async function() {
    const jsonDocument = {
      $Version: '4.0',
      book: {
        $Kind: "EntityType",
        $Key: ["id"],
        id: {
          $Type: 'Edm.String',
          $MaxLength: 24
        },
        author: {
          $Type: 'Edm.String',
          $DefaultValue: "William Shakespeare"
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
    const BookSchema = new Schema({
      author: {
        type: String,
        default: 'William Shakespeare'
      }
    });
    
    const BookModel = mongoose.model('book', BookSchema);

    server.mongoEntity('book', BookModel);
    httpServer = server.listen(port);
    const res = await request(host).get('/$metadata?$format=json');
    assertSuccess(res);
    res.body.should.deepEqual(jsonDocument);
  });

  it('should return xml metadata with default value attribute', async function() {
    const xmlDocument = 
  ` <edmx:Edmx xmlns:edmx="http://docs.oasis-open.org/odata/ns/edmx" Version="4.0">
      <edmx:DataServices>
        <Schema xmlns="http://docs.oasis-open.org/odata/ns/edm" Namespace="node.odata">
          <EntityType Name="book">
            <Key>
              <PropertyRef Name="id"/>
            </Key>
            <Property Name="author" Type="Edm.String" DefaultValue="William Shakespeare"/>
            <Property Name="id" Type="Edm.String" MaxLength="24"/>
          </EntityType>
          <EntityContainer Name="Container">
            <EntitySet Name="book" EntityType="node.odata.book"/>
          </EntityContainer>
        </Schema>
      </edmx:DataServices>
    </edmx:Edmx>`.replace(/\s*</g, '<').replace(/>\s*/g, '>');
    const BookSchema = new Schema({
      author: {
        type: String,
        default: 'William Shakespeare'
      }
    });
    
    const BookModel = mongoose.model('book', BookSchema);

    server.mongoEntity('book', BookModel);
    httpServer = server.listen(port);
    const res = await request(host).get('/$metadata');
    assertSuccess(res);
    res.text.should.equal(xmlDocument);
  });

  it('should return json metadata with boolean property', async function() {
    const jsonDocument = {
      $Version: '4.0',
      book: {
        $Kind: "EntityType",
        $Key: ["id"],
        id: {
          $Type: 'Edm.String',
          $MaxLength: 24
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
    const BookSchema = new Schema({
      salted: {
        type: Boolean
      }
    });
    
    const BookModel = mongoose.model('book', BookSchema);

    server.mongoEntity('book', BookModel);
    httpServer = server.listen(port);
    const res = await request(host).get('/$metadata?$format=json');
    assertSuccess(res);
    res.body.should.deepEqual(jsonDocument);
  });

  it('should return xml metadata with boolean property', async function() {
    const xmlDocument = 
  ` <edmx:Edmx xmlns:edmx="http://docs.oasis-open.org/odata/ns/edmx" Version="4.0">
      <edmx:DataServices>
        <Schema xmlns="http://docs.oasis-open.org/odata/ns/edm" Namespace="node.odata">
          <EntityType Name="book">
            <Key>
              <PropertyRef Name="id"/>
            </Key>
            <Property Name="salted" Type="Edm.Boolean"/>
            <Property Name="id" Type="Edm.String" MaxLength="24"/>
          </EntityType>
          <EntityContainer Name="Container">
            <EntitySet Name="book" EntityType="node.odata.book"/>
          </EntityContainer>
        </Schema>
      </edmx:DataServices>
    </edmx:Edmx>`.replace(/\s*</g, '<').replace(/>\s*/g, '>');
    const BookSchema = new Schema({
      salted: {
        type: Boolean
      }
    });
    
    const BookModel = mongoose.model('book', BookSchema);

    server.mongoEntity('book', BookModel);
    httpServer = server.listen(port);
    const res = await request(host).get('/$metadata');
    assertSuccess(res);
    res.text.should.equal(xmlDocument);
  });

});
