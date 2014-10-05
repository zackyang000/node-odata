***
[CHINESE README](https://github.com/TossShinHwa/node-odata/blob/master/README.cn.md)
***

node-odata
==========

Create awesome REST APIs based on [OData v4](http://www.odata.org/).

  [![NPM Version](https://img.shields.io/npm/v/node-odata.svg?style=flat)](https://www.npmjs.org/package/node-odata)
  [![Build Status](https://img.shields.io/travis/TossShinHwa/node-odata.svg?style=flat)](https://travis-ci.org/TossShinHwa/node-odata)
  [![License](http://img.shields.io/npm/l/node-odata.svg?style=flat)](https://github.com/TossShinHwa/node-odata/blob/master/LICENSE)

```
var express = require('express'),
    odata = require('/Users/zack/node-odata'),
    mongoose = odata.mongoose;
    Schema = mongoose.Schema;
var app = express();

app.use(express.bodyParser());
app.use(express.query());

mongoose.connect("mongodb://localhost/my-app");

odata.set('app', app);

mongoose.model('books', new Schema({
    subject: String,
    author: String,
    price: Number
  }));

odata.register({
    model: 'books',
    url: '/books'
  });

app.listen(3000, function() {
    console.log('OData service has started.');
});

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
Example:
GET http://host/service/books?$select=subject, author
GET http://host/service/books?$top=5&$skip=2
GET http://host/service/books?$filter=price lt 10
...

```

## Install

```
npm install node-odata
```


##What's the OData

The [Open Data Protocol](http://www.odata.org/) (OData) is a data access protocol built on core protocols like HTTP and commonly accepted methodologies like REST for the web.


## What's the node-oata

node-odata is a NodeJS's library abide by OData Protocol [v4.0](http://docs.oasis-open.org/odata/odata/v4.0/os/part1-protocol/odata-v4.0-os-part1-protocol.html).


## APIs

##### odata.resource.register
##### odata.function.register


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

