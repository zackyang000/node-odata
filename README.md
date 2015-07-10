node-odata
==========


Create awesome REST APIs abide by [OData Protocol v4](http://www.odata.org/).  Its purpose is to easier to creating APIs, make you more focus on business logic.

  [![NPM Version](https://img.shields.io/npm/v/node-odata.svg?style=flat)](https://www.npmjs.org/package/node-odata)
  [![npm](https://img.shields.io/npm/dm/node-odata.svg?style=flat)](https://www.npmjs.org/package/node-odata)
  [![Build Status](https://travis-ci.org/TossShinHwa/node-odata.svg?branch=master&style=flat)](https://travis-ci.org/TossShinHwa/node-odata)
  [![Coverage Status](https://coveralls.io/repos/TossShinHwa/node-odata/badge.svg?branch=master)](https://coveralls.io/r/TossShinHwa/node-odata?branch=master)
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
GET /books?$select=title, author
GET /books?$top=3&$skip=2
GET /books?$orderby=price desc
GET /books?$filter=price gt 10
GET ...
```


## Current State

node-odata is currently at an alpha stage, it is stable but not 100% feature complete. node-odata is written by ECMAScript 6 then compiled to ECMAScript 5 by [babel](https://babeljs.io/). It currently have to dependent on MongoDB yet. The current target is to add more features and make other database adapter (eg. MySQL, PostgreSQL).

## Installation

```
npm install node-odata
```


## DOCUMENTATION

- [ENGLISH](http://tossshinhwa.github.io/node-odata/en/)
- [中文](http://tossshinhwa.github.io/node-odata/cn/)


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
  	* [ ] or
  	* [ ] not
  * [ ] Comparison Operators
    * [ ] has
  * [ ] String Functions
  	* [x] indexof
  	* [ ] contains
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
