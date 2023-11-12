import 'should';
import request from 'supertest';
import { host, port, odata, assertSuccess } from '../support/setup';
import mongoose from 'mongoose';
import { BookModel } from '../support/books.model';

const Schema = mongoose.Schema;

describe('mongo.metadata', () => {
  let httpServer, server;

  before(() => {
    mongoose.set('overwriteModels', true);
  })

  beforeEach(async function() {
    server = odata();
  
  });

  afterEach(() => {
    httpServer.close();
  });

  it('should return json metadata and ignore unknown attributes', async function() {
    const jsonDocument = {
      $Version: '4.0',
      book: {
        $Kind: "EntityType",
        $Key: ["id"],
        id: {
          $Type: 'Edm.String',
          $MaxLength: 24,
          $Nullable: true
        },
        price: {
          $Type: 'Edm.Double',
          $Nullable: true
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
    
    const CustomBookModel = mongoose.model('book', BookSchema);

    server.mongoEntity('book', CustomBookModel);
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
            <Property Name="price" Type="Edm.Double" Nullable="true"/>
            <Property Name="author" Type="Edm.String"/>
            <Property Name="id" Type="Edm.String" Nullable="true" MaxLength="24"/>
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
    
    const CustomBookModel = mongoose.model('book', BookSchema);

    server.mongoEntity('book', CustomBookModel);
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
          $MaxLength: 24,
          $Nullable: true
        },
        author: {
          $Type: 'Edm.String',
          $MaxLength: 25,
          $Nullable: true
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
    
    const CustomBookModel = mongoose.model('book', BookSchema);

    server.mongoEntity('book', CustomBookModel);
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
            <Property Name="author" Type="Edm.String" Nullable="true" MaxLength="25"/>
            <Property Name="id" Type="Edm.String" Nullable="true" MaxLength="24"/>
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
    
    const CustomBookModel = mongoose.model('book', BookSchema);

    server.mongoEntity('book', CustomBookModel);
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
          $MaxLength: 24,
          $Nullable: true
        },
        author: {
          $Type: 'Edm.String',
          $DefaultValue: "William Shakespeare",
          $Nullable: true
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
    
    const CustomBookModel = mongoose.model('book', BookSchema);

    server.mongoEntity('book', CustomBookModel);
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
            <Property Name="author" Type="Edm.String" Nullable="true" DefaultValue="William Shakespeare"/>
            <Property Name="id" Type="Edm.String" Nullable="true" MaxLength="24"/>
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
    
    const CustomBookModel = mongoose.model('book', BookSchema);

    server.mongoEntity('book', CustomBookModel);
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
          $MaxLength: 24,
          $Nullable: true
        },
        salted: {
          $Type: 'Edm.Boolean',
          $Nullable: true
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
    
    const CustomBookModel = mongoose.model('book', BookSchema);

    server.mongoEntity('book', CustomBookModel);
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
            <Property Name="salted" Type="Edm.Boolean" Nullable="true"/>
            <Property Name="id" Type="Edm.String" Nullable="true" MaxLength="24"/>
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
    
    const CustomBookModel = mongoose.model('book', BookSchema);

    server.mongoEntity('book', CustomBookModel);
    httpServer = server.listen(port);
    const res = await request(host).get('/$metadata');
    assertSuccess(res);
    res.text.should.equal(xmlDocument);
  });


  it('should render timestamps as nullable for singleton', async function() {
    const xmlDocument =
    ` <edmx:Edmx xmlns:edmx="http://docs.oasis-open.org/odata/ns/edmx" Version="4.0">
      <edmx:DataServices>
        <Schema xmlns="http://docs.oasis-open.org/odata/ns/edm" Namespace="node.odata">
          <EntityType Name="book">
            <Key>
              <PropertyRef Name="id"/>
            </Key>
            <Property Name="author" Type="Edm.String" Nullable="true"/>
            <Property Name="description" Type="Edm.String" Nullable="true"/>
            <Property Name="genre" Type="Edm.String" Nullable="true"/>
            <Property Name="price" Type="Edm.Double" Nullable="true"/>
            <Property Name="publish_date" Type="Edm.DateTimeOffset" Nullable="true"/>
            <Property Name="title" Type="Edm.String" Nullable="true"/>
            <Property Name="id" Type="Edm.String" Nullable="true" MaxLength="24"/>
            <Property Name="createdAt" Type="Edm.DateTimeOffset" Nullable="true"/>
            <Property Name="updatedAt" Type="Edm.DateTimeOffset" Nullable="true"/>
          </EntityType>
          <EntityContainer Name="Container">
            <Singleton Name="book" Type="node.odata.book"/>
          </EntityContainer>
        </Schema>
      </edmx:DataServices>
    </edmx:Edmx>`.replace(/\s*</g, '<').replace(/>\s*/g, '>');

    server.mongoSingleton('book', BookModel);
    httpServer = server.listen(port);
    const res = await request(host).get('/$metadata');
    assertSuccess(res);
    res.text.should.equal(xmlDocument);
  });
});
