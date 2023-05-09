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

## Actions

### Unbound Actions

Unbound Action will be defined over server directly. The interface of the passed function must correspond to the nodejs express middleware. In order for the after-hooks to be called, you should call the next callback. The errors are also passed on via the next callback.

```
server.action('login', async function(req, res, next) {
	// in req.$odata.mongo is your db instance
	try {
		const user = await req.$odata.mongo.user.findOne({
			email: req.body.email
		});

		next();

	} catch(err) {
		next(err);
	}

});
```

### Implementation of an action

The interface of the passed function must correspond to the nodejs express middleware. In order for the after-hooks to be called, you should call the next callback. The errors are also passed on via the next callback.

```
server.action('login', async function(req, res, next) {
	// in req.$odata.mongo is your db instance
	try {
		const user = await req.$odata.mongo.user.findOne({
			email: req.body.email
		});

		next();

	} catch(err) {
		next(err);
	}

});


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

### Hooks

It is possible to specify nodejs express middlewares for the actions to be performed before or after the action.

```
const action = server.action('login', ...);

action.addBefore(function(req, res, next) {
	...
	next();
});

action.addAfter(function(req, res, next) {
	...
});
```

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
