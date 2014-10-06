node-odata
==========

基于[OData v4](http://www.odata.org/)协议构建酷炫的REST APIs.

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

将注册以下路由:

```
GET    /odata/books
GET    /odata/books/:id
POST   /odata/books
PUT    /odata/books/:id
DELETE /odata/books/:id
```

使用以下oData语法进行查询:

```
Example:
GET http://host/service/books?$select=subject, author
GET http://host/service/books?$top=5&$skip=2
GET http://host/service/books?$filter=price lt 10
...

```

## 安装

```
npm install node-odata
```

##OData是什么

[Open Data Protocol](http://www.odata.org/)（OData）是一个基于HTTP的, 支持REST请求的数据访问协议。
##node-odata是什么

node-odata是遵循OData协议 [v4.0](http://docs.oasis-open.org/odata/odata/v4.0/os/part1-protocol/odata-v4.0-os-part1-protocol.html)规范实现的NodeJS版本.


## APIs

##### odata.resources.register(params);
| Param         | Type    | Details  |
|:-------------:|:-------:| -----    |
| params        | objects | test |



##### odata.functions.register(params);


## 已支持的 OData v4 特性

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

## 计划支持的 OData v4 特性
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
