node-odata
==========
Create awesome REST APIs abide by [OData Protocol v4](http://www.odata.org/).  Its purpose is to easier to creating APIs, make you more focus on business logic.

  [![NPM Version](https://img.shields.io/npm/v/node-odata.svg?style=flat)](https://www.npmjs.org/package/node-odata)
  [![Build Status](https://img.shields.io/travis/TossShinHwa/node-odata.svg?style=flat)](https://travis-ci.org/TossShinHwa/node-odata)
  [![License](http://img.shields.io/npm/l/node-odata.svg?style=flat)](https://github.com/TossShinHwa/node-odata/blob/master/LICENSE)

```
var odata = require('node-odata');

odata.set('db', 'mongodb://localhost/my-app');

odata.resources.register({
    url: '/books',
    model: {
        title: String,
        price: Number
    }
});

odata.listen(3000);
```

Registers the following routes:

```
GET    /odata/books
GET    /odata/books/:id
POST   /odata/books
PUT    /odata/books/:id
DELETE /odata/books/:id
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

node-odata is currently at an alpha stage, it is stable but not 100% feature complete. node-odata is written by CoffeeScript then compiled to Javascript. It currently have to dependent on MongoDB yet. The current target is to add more features and make other database adapter (eg. MySQL, PostgreSQL).

## Install

```
npm install node-odata
```


## API Docs

* [resources.register(params)](https://github.com/TossShinHwa/node-odata/wiki/1.resources.register(params))
* [functions.register(params)](https://github.com/TossShinHwa/node-odata/wiki/2.functions.register(params))
* [set(key, value)](https://github.com/TossShinHwa/node-odata/wiki/3.set(key, value))

## Demo

[Live](http://books.zackyang.com/odata/books) and try it:

* GET [/books?$select=title, author](http://books.zackyang.com/odata/books?$select=title, author)
* GET [/books?$top=3&$skip=2](http://books.zackyang.com/odata/books?$top=3&$skip=2)
* GET [/books?$orderby=price desc](http://books.zackyang.com/odata/books?$orderby=price desc)
* GET [/books?$filter=price gt 10](http://books.zackyang.com/odata/books?$filter=price gt 10)


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
* [ ] XML/JSON format


## CONTRIBUTING

We always welcome contributions to help make node-odata better. Please feel free to contribute to this project.

## LICENSE

node-odata is licensed under the MIT license. See [LICENSE](LICENSE) for more information.