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
var odata = require('node-odata');

var server = odata('mongodb://localhost/my-app');

server.resource('books', {
  title: String,
  price: Number
});

server.listen(3000);
```

Registers the following routes:

```
GET    /books
GET    /books(:id)
POST   /books
PUT    /books(:id)
DELETE /books(:id)
GET    /books/$metadata
```

Use the following OData query:

```
Example
GET /books?$select=id, title
GET /books?$top=3&$skip=2
GET /books?$orderby=price desc
GET /books?$filter=price gt 10
GET /books/$metadata
GET ...
```

### Further options

The odata constructor takes 3 arguments: ```odata(<mongoURL>, <dbPrefix>, <options>);```

The options object currently only supports one parameter: ```expressRequestLimit```, this will be parsed to the express middelware as the "limit" option, which allows for configuring express to support larger requests. It can be either a number or a string like "50kb", 20mb", etc.

# How to

## Entities

With entities you can provide a kind of virtual table via the OData service. The following operations can be implemented on an entity:
 - list: Returns one or more items from the list. The result array must be encapsulated in a property named "value". e.g.({value: []})
 - get: Returns exactly one item
 - post: Creates a new Item
 - put: Updates an existing item
 - delete: Deletes an exsiting item
 - patch: Merges properties of an existing items with incomming attributes
 - count: Returns a count of items in the list

Here an example of an entity implementation. To define an entity, you must call the server.entity method. Pass the name of the entity as the first parameter. The second parameter allows you to pass the implementation for each operation. If you do not pass a handler for an operation, calling that operation returns "Not Implemented". With the third parameter you pass the description of your entity. An object with the $Key property in which you list the names of all key columns. The other properties of the object describe the properties of your entity.

```
const odata = require('node-odata');
const server = odata(process.env.DATABASE || 'mongodb://localhost:27017/example');


server.complexType('fullName', {
  first: {
    $Type: 'Edm.String'
  },
  last: {
    $Type: 'Edm.String'
  }
});

const entity = server.entity('user', {
  list: async (req, res) => {
    res.$odata.status = 200;
    res.$odata.result = {
      value: [{ 
				id: '1',
				name: { first: 'Max', last: 'Mustermann' }
			}]
    };

  },
	count: async (req, res) => {
    res.$odata.status = 200;
    res.$odata.result = 1;
	}
}, {
  $Key: ['title'],
  id: {
    $Type: 'node.odata.ObjectId'
  },
  name: {
    $Type: 'node.odata.fullName'
  },
  email: {
    $Type: 'Edm.String'
  }
});
```

## Actions

### Unbound Actions

Unbound Action will be defined over server directly. 

```
server.action('login', async function(req, res) {
	// in req.$odata.mongo is your db instance

	res.$odata.result = await req.$odata.mongo.user.findOne({
		email: req.body.email
	});

});
```

Calling an unbound action

```
POST /node.odata.login
```

### Bound Actions

Bound Action are defined over resource. An action can be bound to single resource or to collection of resources. For the bound action, the first parameter of the bound resource type is specified in the metadata.

#### Entity Actions

```
resource.action('bound-action', (req, res) => {
	...
}, { binding: 'entity' });
```

will be called

```
POST /book('01234')/bound-action
```

#### Collection Actions

```
resource.action('bound-action', (req, res) => {
	...
}, { binding: 'collection' });
```

will be called

```
POST /book/bound-action
```

### Implementation of an action

The interface of the passed function must correspond to the nodejs express middleware. You should assign the result to the res.$odata.result attribute. An error can be thrown and it can contain the status attribute.

```
server.action('login', async function(req, res) {
	// in req.$odata.mongo is your db instance

    res.$odata.result = {
				user: await req.$odata.mongo.user.findOne({
				email: req.body.email
			})
		}

		if (!res.$odata.result) {
			const err = new Error('Login failed');

			err.status = 403;
			throw err;
		}

});
```


### Parameter

Parameters can be defined for the action. These will be output in the metadata.

```
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

- $Type	Build-In Types(Edm.\*) or custom defined types(node.odata.*)
- $Collection true/false
- $Nullable true/false
- $MaxLength Number bigger than zero
- $DefaultValue any text
- $Unicode true/false
- $SRID not negative Number
  

## Hooks

It is possible to specify nodejs express middlewares for the actions or entities to be performed before or after the action. Any data assigned to req.$odata or res.$odata will be available on action implementation and subsequent hooks. An error thrown in the hook interrupts further processing. it is possible to provide a name of hook for tracing. You can use a [passportjs](https://www.passportjs.org/) middleware as before hook for authentication.

```
const action = server.action('login', ...);

action.addBefore(async (req, res) => {
	...
	res.$odata.result = { result: 'any' }; // client receives: { result: 'any' }
}, 'name-of-hook');

action.addBefore(async (req, res) => {
	if (!req.user) {
		const err = new Error();

		err.status = 401;
		throw err;
	}
});

action.addAfter(async (req, res) => {
	...
}, 'name-of-hook');
```

## Loging

In the event of an unexpected error, no meaningful error message is returned to the frontend. This is necessary to make it harder for hackers. However, the development will not be easy either. For this reason there are additional logging routines. Logging can be switched on and off by setting the log level. To do this, you would have to set the environment variable ```LOG_LEVEL``` to the value ```debug```. In this case, messages that are still not meaningful are sent to the frontend, but the exception objects are logged in the log files. In addition, the start of processing of each resource and each hook is also logged.

## Current State

node-odata is currently at an beta stage, it is stable but not 100% feature complete. 
node-odata is written by ECMAScript 6 then compiled by [babel](https://babeljs.io/).
It currently have to dependent on MongoDB yet. 
The current target is to add more features (eg. $metadata) and make to support other database. (eg. MySQL, PostgreSQL).

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


## CONTRIBUTING

We always welcome contributions to help make node-odata better. Please feel free to contribute to this project. The package-lock.json file was last created with node version 16.14.2.


## LICENSE

node-odata is licensed under the MIT license. See [LICENSE](LICENSE) for more information.
