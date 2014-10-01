node-odata
==========

Create awesome oData APIs using express.
使用express创建酷炫的oData APIs

```

##What's the oData
##什么是oData

The Open Data Protocol (OData) is a data access protocol built on core protocols like HTTP and commonly accepted methodologies like REST for the web.

```
var express = require('express'),
    odata = require('node-odata'),
    mongoose = odata.mongoose;
var app = express();

app.use(express.bodyParser());
app.use(express.query());

mongoose.connect("mongodb://localhost/my-app");

var books = odata.resource('book', mongoose.Schema({
    subject: 'string',
    author: 'string',
  }));

odata.register({
    model: books,
    url: '/book'
  });

app.listen(3000);

```

Registers the following routes:

```
GET /resources
GET /resources/:id
POST /resources
PUT /resources/:id
DELETE /resources/:id
```

## 安装

## 创建

## 运行

## 文档
  odata.function.register

## 已支持的 OData v4 特性

* Full CRUD
* XML/JSON format
* $count
* $filter
  * Comparison Operators (eq, ne, lt, le, gt, ge)
  * Logical Operators (and)
* $select
* $top
* $skip
* $expand - Navigation properties
* $orderbyService operations

## 计划支持的 OData v4 特性
* $filter
  * Comparison Operators (has)
  * Logical Operators (or, not)
  * Arithmetic Operators (add, sub, mul, div, mod)
  * String Functions (contains, endswith, startswith, length, indexof, substring, tolower, toupper, trim ,concat)
  * Date Functions (year, month, day, hour, minute, second, fractionalseconds, date, time, totaloffsetminutes, now, mindatetime, maxdatetime)
  * Math Functions (round, floor, ceiling)
* $metadata generation
* XML/JSON format

## 不支持的 OData v4 特性
* $filter
  * Type Functions (cast, isof)
  * Geo Functions (geo.distance, geo.length, geo.intersects)
