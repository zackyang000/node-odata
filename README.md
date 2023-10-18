node-odata
==========

Create awesome REST APIs abide by [OData Protocol v4](http://www.odata.org/).  Its purpose is to easier to creating APIs, make you more focus on business logic.

  [![NPM Version](https://img.shields.io/npm/v/node-odata.svg?style=flat)](https://www.npmjs.org/package/node-odata)
  [![npm](https://img.shields.io/npm/dm/node-odata.svg?style=flat)](https://www.npmjs.org/package/node-odata)
  [![Build Status](https://travis-ci.org/zackyang000/node-odata.svg?branch=master)](https://travis-ci.org/zackyang000/node-odata)
  [![Coverage Status](https://coveralls.io/repos/github/zackyang000/node-odata/badge.svg?branch=master)](https://coveralls.io/github/zackyang000/node-odata?branch=master)
  [![Dependency Status](https://david-dm.org/zackyang000/node-odata.svg?style=flat)](https://david-dm.org/zackyang000/node-odata)
  [![License](http://img.shields.io/npm/l/node-odata.svg?style=flat)](https://raw.githubusercontent.com/zackyang000/node-odata/master/LICENSE)

```JavaScript
const odata = require('node-odata');
const server = odata('mongodb://localhost/my-app');
const mongoose = require('mongoose');
const connection = mongoose.connect('mongodb://localhost:27017/example', null, (err) => {
  if (err) {
    console.error(err.message);
    console.error('Failed to connect to database on startup.');
    process.exit();
  }
});
const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const ModelSchema = new Schema({
  title: String,
  price: Number
});
const Model = mongoose.model('books', ModelSchema);

server.mongoEntity('books', Model);

server.listen(3000);
```

Registers the following routes:

```
GET    /books
GET    /books(':id')
POST   /books
PUT    /books(':id')
DELETE /books(':id')
GET    /books/$metadata
GET    /books/$count
```

Use the following OData query:

```
Example
GET /books?$select=id, title
GET /books?$top=3&$skip=2
GET /books?$orderby=price desc
GET /books?$filter=price gt 10
GET /books/$metadata
GET /books/$count
GET ...
```

### Further options

The odata constructor takes 2 arguments: ```odata(<dbPrefix>, <options>);```

The options object currently only supports one parameter: ```expressRequestLimit```, this will be parsed to the express middelware as the "limit" option, which allows for configuring express to support larger requests. It can be either a number or a string like "50kb", 20mb", etc.

# How to

## With MongoDB

For MongoDB, the entity and singleton operations have been implemented, so they require very little code to provide collections via OData. The database is decoupled from the OData implementation, so you need to inject the database connection first. This happens as follows:

```JavaScript
const mongoose = require('mongoose');
const connection = mongoose.connect('mongodb://localhost:27017/example', null, (err) => {
  if (err) {
    console.error(err.message);
    console.error('Failed to connect to database on startup.');
    process.exit();
  }
});
const odata = require('node.odata');
const server = odata();

server.addBefore((req, res, next) => {
  req.$odata = {
    ...req.$odata,
    mongo: connection
  };
  next();
});
```
You then have to define the collection as usual.

```JavaScript
const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const ModelSchema = new Schema(...);
const Model = mongoose.model(...);
```

Afterwards, providing the collections is very easy.

```JavaScript
server.entity('book', Model);

// or singleton
server.singleton('config', Model);
```

For inserting code before or after the standard operations, you can use [Hooks](#hooks). In the after hook you find the result of the standard operation in res.$odata.result.

## Custom implementation

If the standard implementation cannot be used, you have the option of implementing an entity or singleton yourself. If you have injected the database as stated above, it will be available in the middlewares in req.$odata.mongo. The following things should be taken into account when implementing your own implementations:

- The result must be written to res.$odata.result
- An http status must be written in req.$odata.status
- the next callback must be called at the end
- The response process should not be terminated.
- No data should be written to the response
- The status of the response should not be set

### Entities

With entities you can provide a kind of virtual table via the OData service. The following operations can be implemented on an entity:
 - list: Returns one or more items from the list. The result array must be encapsulated in a property named "value". e.g.({value: []})
 - get: Returns exactly one item
 - post: Creates a new Item
 - put: Updates an existing item
 - delete: Deletes an exsiting item
 - patch: Merges properties of an existing items with incomming attributes
 - count: Returns a count of items in the list

Here an example of an entity implementation. To define an entity, you must call the server.entity method. Pass the name of the entity as the first parameter. The second parameter allows you to pass the implementation for each operation. If you do not pass a handler for an operation, calling that operation returns "Not Implemented". With the third parameter you pass the description of your entity. An object with the $Key property in which you list the names of all key columns. The other properties of the object describe the properties of your entity.

```JavaScript
const odata = require('node-odata');
const server = odata();

server.complexType('fullName', {
  first: {
    $Type: 'Edm.String'
  },
  last: {
    $Type: 'Edm.String'
  }
});

const entity = server.entity('user', {
  list: (req, res, next) => {
    try {
      res.$odata.status = 200;
      res.$odata.result = {
        value: [{ 
          id: '1',
          name: { first: 'Max', last: 'Mustermann' }
        }]
      };

      next();

    } catch(error) {
      next(error);
    }

  },
  count: async (req, res) => {
    try {
      res.$odata.status = 200;
      res.$odata.result = 1;

      next();

    } catch(error) {
      next(error);
    }
  }
}, {
  $Key: ['id'],
  id: {
    $Type: 'Edm.String',
    $MaxLength: 24
  },
  name: {
    $Type: 'node.odata.fullName'
  },
  email: {
    $Type: 'Edm.String'
  }
});
```

### Singleton

With a Singleton entity, you don't provide a collection via OData, but rather a single object. Compared to Entity, Singleton does not support list and count operations. The difference lies in the URL of get requests too. This is what the requests for the currentUser singleton would look like.

```
GET current-user
POST current-user
PUT current-user
DELETE current-user
```

Singleton can be defined standalone.

```JavaScript
const odata = require('node-odata');
const server = odata();

const entity = server.singleton('user', {
  get: (req, res, next) => {
    try {
      res.$odata.status = req.user ? 200 : 403;
      res.$odata.result = req.user;

      next();

    } catch(error) {
      next(error);
    }

  }
}, {
  $Key: ['id'],
  id: {
    $Type: 'Edm.String',
    $MaxLength: 24
  },
  email: {
    $Type: 'Edm.String'
  }
});
```

Or a singleton can be created for an existing entity.

```JavaScript
const odata = require('node-odata');
const server = odata();

...

const user = server.mongoEntity('user', Model);
server.singletonFrom('current-user', {
  get: (req, res, next) => {
    res.$odata.status = req.user ? 200 : 403;
    res.$odata.result = req.user;
    
    next();
  }
}, user);
```

## Actions

### Unbound Actions

Unbound Action will be defined over server directly. 

```JavaScript
server.action('login', async function(req, res) {
  try {
    // in req.$odata.mongo is your db instance

    res.$odata.result = await req.$odata.mongo.user.findOne({
      email: req.body.email
    });

    next();

  } catch(error) {
    next(error);
  }
});
```

Calling an unbound action

```
POST /node.odata.login
```

### Bound Actions

Bound Action are defined over entity. An action can be bound to single entity or to collection of entities. For the bound action, the first parameter of the bound entity type is specified in the metadata.

#### Entity Actions

```JavaScript
entity.action('bound-action', (req, res) => {
	...
}, { binding: 'entity' });
```

will be called

```
POST /book('01234')/bound-action
```

#### Collection Actions

```JavaScript
entity.action('bound-action', (req, res) => {
	...
}, { binding: 'collection' });
```

will be called

```
POST /book/bound-action
```

### Implementation of an action

The interface of the passed function must correspond to the nodejs express middleware. You should assign the result to the res.$odata.result attribute. An error can be thrown and it can contain the status attribute.

```JavaScript
server.action('login', async function(req, res) {
  try {
    // in req.$odata.mongo is your db instance

    res.$odata.result = {
      user: await req.$odata.mongo.user.findOne({
        email: req.body.email
      })
    };

    if (!res.$odata.result) {
      const err = new Error('Login failed');

      err.status = 403;
      throw err;
    }

    next();

  } catch(error) {
    next(error);
  }
});
```


### Parameter

Parameters can be defined for the action. These will be output in the metadata.

```JavaScript
server.action('login', async function(req, res, next) {
	...
}, {
  $Parameter: [{
    $Type: 'Edm.String',
    $Name: 'email'
  }, {
    $Type: 'Edm.String',
    $Name: 'password'
  }]
});
```
The following attributes can be specified for parameters:

- $Type	Build-In Types(Edm.\*) or custom defined types(node.odata.\*)
- $Collection true/false
- $Nullable true/false
- $MaxLength Number bigger than zero
- $DefaultValue any text
- $Unicode true/false
- $SRID not negative Number
  

## Hooks

It is possible to specify nodejs express middlewares for the actions or entities to be performed before or after the action. Any data assigned to req.$odata or res.$odata will be available on action implementation and subsequent hooks. An error thrown in the hook interrupts further processing. it is possible to provide a name of hook for tracing. You can use a [passportjs](https://www.passportjs.org/) middleware as before hook for authentication.

```JavaScript
const action = server.action('login', ...);

action.addBefore((req, res, next) => {
	...
	res.$odata.result = { result: 'any' }; // client receives: { result: 'any' }
  next();
});

action.addBefore((req, res, next) => {
	if (!req.user) {
		const err = new Error();

		err.status = 401;
		next(err);
	}
});

action.addAfter(async (req, res, next) => {
	...
});
```

## Batch request

node-odata is able to process a collected request. This means the client can send multiple operations with one query. The request must be sent to the $batch Url with a POST request.

```
POST $batch
```

With such body

```Json
{
  requests: [{
    id: "1",
    method: "post",
    url: "/book",
    body: {
      title: "Guide of War and Peace"
    }
  }, {
    id: "2",
    method: "get",
    url: "/book?$filter=contains(title, 'Guide')&$select=title"
  }]
}
```

The answer could look like this

```JSON
{
  responses: [{
    id: "1",
    status: 201,
    statusText: "Created",
    headers: {
      'OData-Version': "4.0",
      'content-type': "application/json"
    },
    body: {
      id: "AFFE",
      title: "Guide of War and Peace"
    }
  }, {
    id: "2",
    status: 200,
    statusText: "OK",
    headers: {
      'OData-Version': "4.0",
      'content-type': "application/json"
    },
    body: {
      value: [{
        title: "Guide of War and Peace"
      }]
    }
  }
}
```

## Annotations

At the different levels of the service, you can extend the metadata using annotations. Before an annotation can be applied, it must first be defined. Here we defined a simple annotation called 'readonly' of type 'boolean'. The scope of annotation is limited to the properties of entities and singletons.

```Javascript
const vocabulary = server.vocabulary();

vocabulary.define('readonly', 'boolean', ['Property']);
```

The metadata can be annotated directly in your definition

```Javascript
server.entity('book', null, {
  $Key: ['id'],
  id: {
    ...
  },
  author: {
    $Type: 'Edm.String',
    ...vocabulary.annotate('readonly', 'Property', true)
  }
});
```

or later. This variant has the advantage that the name of the property can be validated against the metadata of the entity.

```Javascript
const book = server.entity('book', null, {
  $Key: ['id'],
  id: {
    ...
  },
  author: {
    $Type: 'Edm.String'
  }
});

book.annotateProperty('author', 'readonly', true);
```

The parameters of the actions can also be annotated.

```Javascript
vocabulary.define('readonly', 'boolean', ['Parameter']);

const action = server.action('changePassword',
  (req, res, next) => { }, {
  $Parameter: [{
    $Type: 'Edm.String',
    $Name: 'newPassword'
  }, {
    ...
  }]
});

action.annotateParameter('newPassword', 'readonly', true);
```
In addition, complex annotations can be defined. This allows entities, singletons and actions to be annotated. The passed list is validated against the properties or parameters.

```Javascript
const vocabulary = server.vocabulary();

vocabulary.define('filterable', {
  item: ['property'], // property for Entities and Singletons, parameter for Actions
  type: 'string'
}, ['Entity Type']); // Entiy Type, Singleton, Action

const entity = server.entity('book', null, {
  $Key: ['id'],
  id: {
    ...
  },
  author: {
    $Type: 'Edm.String'
  },
  title: {
    $Type: 'Edm.String'
  }
});

entity.annotate('filterable', ['author', 'title']);
```

## Current State

node-odata is currently at an beta stage, it is stable but not 100% feature complete. 
node-odata is written by ECMAScript 6 then compiled by [babel](https://babeljs.io/).
It currently supports MongoDB only. 
The current target is to add more features and make to support other database. (eg. MySQL, PostgreSQL).

## Installation

```
npm install node-odata
```


## DOCUMENTATION

- [ENGLISH](http://zackyang000.github.io/node-odata/en/)
- [中文](http://zackyang000.github.io/node-odata/cn/)


## Demo

[Live demo](http://books.zackyang.com/book) and try it:

* GET [/books?$select=id, title](http://books.zackyang.com/books?$select=id,%20title)
* GET [/books?$top=3&$skip=2](http://books.zackyang.com/books?$top=3&$skip=2)
* GET [/books?$orderby=price desc](http://books.zackyang.com/books?$orderby=price%20desc)
* GET [/books?$filter=price gt 10](http://books.zackyang.com/books?$filter=price%20gt%2010)
* GET [/books/$metadata](http://books.zackyang.com/books/$metadata)

## Support Feature

* [x] Full CRUD Support
* [x] $count
* [x] $filter
  * [x] Comparison Operators
  	* [x] eq
  	* [x] ne
  	* [x] lt
  	* [x] le
  	* [x] gt
  	* [x] ge
  * [ ] Logical Operators
  	* [x] and
  	* [x] or
  	* [ ] not
  * [ ] Comparison Operators
    * [ ] has
  * [ ] String Functions
  	* [x] indexof
  	* [x] contains
  	* [ ] endswith
  	* [ ] startswith
  	* [ ] length
  	* [ ] substring
  	* [ ] tolower
  	* [ ] toupper
  	* [ ] trim
  	* [ ] concat
  * [ ] Arithmetic Operators
  	* [ ] add
  	* [ ] sub
  	* [ ] mul
  	* [ ] div
  	* [ ] mod
  * [ ] Date Functions
  	* [x] year
  	* [ ] month
  	* [ ] day
  	* [ ] hour
  	* [ ] minute
  	* [ ] second
  	* [ ] fractionalseconds
  	* [ ] date
  	* [ ] time
  	* [ ] totaloffsetminutes
  	* [ ] now
  	* [ ] mindatetime
  	* [ ] maxdatetime
  * [ ] Math Functions
  	* [ ] round
  	* [ ] floor
  	* [ ] ceiling
* [x] $select
* [x] $top
* [x] $skip
* [x] $orderby
* [ ] $expand
* [x] $metadata generation
* [X] Batch request
* [X] Singleton
* [X] Annotations


## CONTRIBUTING

We always welcome contributions to help make node-odata better. Please feel free to contribute to this project. The package-lock.json file was last created with node version 18.17.0. Current implementation ist tested with MongoDB version 4.4.4.


## LICENSE

node-odata is licensed under the MIT license. See [LICENSE](LICENSE) for more information.
