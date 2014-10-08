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

注册一个OData资源, 可以使用OData格式的请求对其进行读写.
register a resource for OData that support writing and reading data using the OData formats.

###### Arguments

params: {object} in the form of

| Name          | Type              | Details                             | 
|---------------|-------------------|-------------------------------------|
| url           | string            | 资源的url                            |
| model         | string            | 资源对应的mongoose model的名字         |
| options       | object (optional) | 配置该资源最大允许查询条数, 默认排序字段等 |
| auth          | object (optional) | 配置POST, PUT, GET, DELETE的权限      |
| actions       | array (optional)  | 该资源附加的action ([什么是action?](http://docs.oasis-open.org/odata/odata/v4.0/os/part1-protocol/odata-v4.0-os-part1-protocol.html#_Actions_1))|


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

在路由中注册一个function. ([什么是function?](http://docs.oasis-open.org/odata/odata/v4.0/os/part1-protocol/odata-v4.0-os-part1-protocol.html#_Functions_1))

###### Arguments

params: {object} in the form of

| Name          | Type                             | Details                             | 
|---------------|----------------------------------|-------------------------------------|
| url           | string                           | function url                        |
| method        | ["POST", "PUT", "GET", "DELETE"] | function http method                |
| auth          | function(optional)               | 配置访问此function的权限               |
| handle        | function                         | function的具体实现                    |                    |


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

配置odata的默认行为

| Allow Key     | Value Type                       | Details                                | 
|---------------|----------------------------------|----------------------------------------|
| app           | string                           | 设置express实例对象                      |
| prefix        | string                           | 设置url前缀, 默认为'odata'               |
| maxTop        | int                              | 设置所有资源默认允许最大查询条数, 默认无限制  |
| maxSkip       | int                              | 设置所有资源默认允许最大跳过条数, 默认无限制  |
| orderby       | string                           | 设置所有资源默认排序方式                   | 


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


