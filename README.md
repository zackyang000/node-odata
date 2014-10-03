node-odata
==========

Create awesome REST APIs based on OData v4.

基于OData v4协议构建酷炫的REST APIs.


```
var express = require('express'),
    odata = require('node-odata'),
    mongoose = odata.mongoose;
var app = express();

app.use(express.bodyParser());
app.use(express.query());

mongoose.connect("mongodb://localhost/my-app");

var books = mongoose.Schema({
    subject: String,
    author: String,
    price: Number
  });

odata.register({
    model: books,
    url: '/books'
  });

app.listen(3000);

```

Registers the following routes:
将注册以下路由

```
GET    /books
GET    /books/:id
POST   /books
PUT    /books/:id
DELETE /books/:id
```

可使用以下oData语法进行查询

```
Example:
GET http://host/service/books?$select=subject, author
GET http://host/service/books?$top=5&$skip=2
GET http://host/service/books?$filter=price lt 10
...

```

##What's the OData
##什么是OData

The Open Data Protocol (OData) is a data access protocol built on core protocols like HTTP and commonly accepted methodologies like REST for the web.

## 安装

## APIs
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
