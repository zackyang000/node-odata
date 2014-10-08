***
[CHINESE README](https://github.com/TossShinHwa/node-odata/blob/master/README-cn.md)
***

node-odata
==========

Create awesome REST APIs based on [OData v4](http://www.odata.org/).

  [![NPM Version](https://img.shields.io/npm/v/node-odata.svg?style=flat)](https://www.npmjs.org/package/node-odata)
  [![Build Status](https://img.shields.io/travis/TossShinHwa/node-odata.svg?style=flat)](https://travis-ci.org/TossShinHwa/node-odata)
  [![License](http://img.shields.io/npm/l/node-odata.svg?style=flat)](https://github.com/TossShinHwa/node-odata/blob/master/LICENSE)

```
var express = require('express'),
    odata = require('node-odata'),
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

odata.resources.register({
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


## APIs

### 1. resources.register(params);

register a resource for OData that support writing and reading data using the OData formats.

###### Arguments

params: {object} in the form of

| Name          | Type              | Details                                     | 
|---------------|-------------------|---------------------------------------------|
| url           | string            | resource url                                |
| model         | string            | mongoose model name                         |
| options       | object (optional) | setting max query count, default order, etc. |
| auth          | object (optional) | setting authorize of POST, PUT, GET, DELETE  |
| actions       | array (optional)  | actions of resource ([What's the action?](http://docs.oasis-open.org/odata/odata/v4.0/os/part1-protocol/odata-v4.0-os-part1-protocol.html#_Actions_1))|


###### Returns

undefined

###### Example

```
Book = mongoose.model("books");


odata.resources.register({
    url: '/books',
    model: 'books',
    options: {
        maxTop: 100,
        maxSkip: 10000,
        orderby: 'date desc'
    },
    auth: {
        "POST,PUT": function(req){ return req.user.isAdmin; }
        "DELETE": function(req){ return false; }
    },
    actions: [{
    	url: '/convert-to-free'
        handle: function(req, res, next) {
            Book.findById(req.params.id, function(err, book) {
                if (err) {
                    next(err);
                }
                book.price = 0;
                Book.save(function(err) {
                    if (err) {
                        next(err);
                    }
                    res.jsonp(book);
              });
            });
        },
        auth: function(req){ return req.user.isAdmin; }
    }]
 });
});

```
 
### 2. functions.register(params);

Register a function to route. ([What's the function?](http://docs.oasis-open.org/odata/odata/v4.0/os/part1-protocol/odata-v4.0-os-part1-protocol.html#_Functions_1))

###### Arguments

params: {object} in the form of

| Name          | Type                             | Details                             | 
|---------------|----------------------------------|-------------------------------------|
| url           | string                           | function url                        |
| method        | ["POST", "PUT", "GET", "DELETE"] | function http method                |
| auth          | function(optional)               | setting authorize of function       |
| handle        | function                         | function handle                     |                    |


###### Returns

undefined

###### Example

```
odata.functions.register({
  url: '/server-time',
  method: 'GET',
  handle: function(req, res, next) {
    return res.json({
      date: new Date()
    });
  }
});

```

### 3. set(key, value)

Configuring default behavior

| Allow Key     | Value Type                       | Details                                    | 
|---------------|----------------------------------|--------------------------------------------|
| app           | string                           | setting express instance                   |
| prefix        | string                           | setting url prefix, default is 'odata'     |
| maxTop        | int                              | setting golbal max allow query items count |
| maxSkip       | int                              | setting golbal max allow skip items count  |
| orderby       | string                           | setting golbal default order               | 


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


## What's the OData

The [Open Data Protocol](http://www.odata.org/) (OData) is a data access protocol built on core protocols like HTTP and commonly accepted methodologies like REST for the web.


## What's the node-oata

node-odata is a NodeJS's library abide by OData Protocol [v4.0](http://docs.oasis-open.org/odata/odata/v4.0/os/part1-protocol/odata-v4.0-os-part1-protocol.html).


