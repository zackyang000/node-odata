node-odata
==========

node-odata是一个基于oData协议, 由node实现的REST API框架. 它可以让你轻松的编写基于odata的相关API.

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
  * Type Functions
  * Geo Functions
