node-odata
==========

Create awesome REST APIs abide by [OData Protocol v4](http://www.odata.org/).  Its purpose is to easier to creating APIs, make you more focus on business logic.

  [![NPM Version](https://img.shields.io/npm/v/node-odata.svg?style=flat)](https://www.npmjs.org/package/node-odata)
  [![npm](https://img.shields.io/npm/dm/node-odata.svg?style=flat)](https://www.npmjs.org/package/node-odata)
  [![Build Status](https://travis-ci.org/TossShinHwa/node-odata.svg?branch=master)](https://travis-ci.org/TossShinHwa/node-odata)
  [![Coverage Status](https://coveralls.io/repos/github/TossShinHwa/node-odata/badge.svg?branch=master)](https://coveralls.io/github/TossShinHwa/node-odata?branch=master)
  [![Dependency Status](https://david-dm.org/TossShinHwa/node-odata.svg?style=flat)](https://david-dm.org/TossShinHwa/node-odata)
  [![License](http://img.shields.io/npm/l/node-odata.svg?style=flat)](https://raw.githubusercontent.com/TossShinHwa/node-odata/master/LICENSE)

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
```

Use the following OData query:

```
Example
GET /books?$select=id, title
GET /books?$top=3&$skip=2
GET /books?$orderby=price desc
GET /books?$filter=price gt 10
GET ...
```

### Further options

The odata constructor takes 3 arguments: ```odata(<mongoURL>, <dbPrefix>, <options>);```

The options object currently only supports one parameter: ```expressRequestLimit```, this will be parsed to the express middelware as the "limit" option, which allows for configuring express to support larger requests. It can be either a number or a string like "50kb", 20mb", etc.


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

- [ENGLISH](http://tossshinhwa.github.io/node-odata/en/)
- [中文](http://tossshinhwa.github.io/node-odata/cn/)


## Demo

[Live demo](http://books.zackyang.com/book) and try it:

* GET [/book?$select=id, title](http://books.zackyang.com/book?$select=id, title)
* GET [/book?$top=3&$skip=2](http://books.zackyang.com/book?$top=3&$skip=2)
* GET [/book?$orderby=price desc](http://books.zackyang.com/book?$orderby=price desc)
* GET [/book?$filter=price gt 10](http://books.zackyang.com/book?$filter=price gt 10)

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
* [x] $metadata generation (Nonstandard)


## CONTRIBUTING

We always welcome contributions to help make node-odata better. Please feel free to contribute to this project.


## LICENSE

node-odata is licensed under the MIT license. See [LICENSE](LICENSE) for more information.
