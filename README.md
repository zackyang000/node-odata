node-odata
==========
Create awesome REST APIs abide by [OData Protocol v4](http://www.odata.org/).  Its purpose is to easier to creating APIs, make you more focus on business logic.

  [![NPM Version](https://img.shields.io/npm/v/node-odata.svg?style=flat)](https://www.npmjs.org/package/node-odata)
  [![Build Status](https://img.shields.io/travis/TossShinHwa/node-odata.svg?style=flat)](https://travis-ci.org/TossShinHwa/node-odata)
  [![License](http://img.shields.io/npm/l/node-odata.svg?style=flat)](https://github.com/TossShinHwa/node-odata/blob/master/LICENSE)

```
var express = require('express'),
    odata = require('node-odata');
var app = express();

app.use(express.bodyParser());
app.use(express.query());

odata.set('app', app);
odata.set('db', 'mongodb://localhost/my-app');
odata.resources.register({ url: '/books', model: { title: String, price: Number } });

app.listen(3000);
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

Try it:

* GET [/books?$select=title, author](http://books.zackyang.com/odata/books?$select=title, author)
* GET [/books?$top=3&$skip=2](http://books.zackyang.com/odata/books?$top=3&$skip=2)
* GET [/books?$orderby=price desc](http://books.zackyang.com/odata/books?$orderby=price desc)
* GET [/books?$filter=price gt 10](http://books.zackyang.com/odata/books?$filter=price gt 10)

## Current State

node-odata is currently at an alpha stage, it is stable but not 100% feature complete. node-odata is written by CoffeeScript then compiled to Javascript. It currently have to dependent on Express, MongoDB and mongoose yet. The current target is to remove the dependents then add more features.

## Install

```
npm install node-odata
```


## APIs

* [resources.register(params)](https://github.com/TossShinHwa/node-odata/wiki/1.resources.register(params))
* [functions.register(params)](https://github.com/TossShinHwa/node-odata/wiki/2.functions.register(params))
* [set(key, value)](https://github.com/TossShinHwa/node-odata/wiki/3.set(key, value))

## Support OData v4 Feature

* Full CRUD Request
* $count
* $filter
  * Comparison Operators (eq, ne, lt, le, gt, ge)
  * Logical Operators (and)
  * String Functions (indexof)
* $select
* $top
* $skip
* $orderby


## Will Be Support OData v4 Feature

* $expand
* $filter
  * Comparison Operators (has)
  * Logical Operators (or, not)
  * Arithmetic Operators (add, sub, mul, div, mod)
  * String Functions (contains, endswith, startswith, length, substring, tolower, toupper, trim ,concat)
  * Date Functions (year, month, day, hour, minute, second, fractionalseconds, date, time, totaloffsetminutes, now, mindatetime, maxdatetime)
  * Math Functions (round, floor, ceiling)
* $metadata generation
* XML/JSON format
