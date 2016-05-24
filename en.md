---
title: node-odata Documentation
markdown2extras: wiki-tables
---

# About node-odata


Create awesome REST APIs abide by [OData](http://www.odata.org/).  Its purpose is to easier to creating APIs, make you more focus on business logic.

## What's the OData?

The Open Data Protocol (OData) is a data access protocol for the web. OData provides a uniform way to query and manipulate data sets through CRUD operations (create, read, update, and delete).

## Why node-odata?

node-odata support the OData powerful data query feature, and provided high concurrency of NodeJS, allowing developers to quickly create a REST API which provide a high-performance and support a series of complex queries.

## Current State

node-odata is currently at an alpha stage, it is stable but not 100% feature complete. node-odata is written by ECMAScript 6 then compiled to ECMAScript 5 by babel. It currently have to dependent on MongoDB yet. The current target is to add more features and make other database adapter (eg. MySQL, PostgreSQL).

# 1) Install

node-odata depends on [NodeJS](http://nodejs.org/) and [MongoDB](http://www.mongodb.org/), after installing the dependencies, run:

    $ npm install node-odata


# 2) Quick Start

We will create and run a simple OData services.

## 2.1 Create

After **node-odata** installation is complete, create * index.js * file and enter the following code:

    var odata = require('node-odata');
    
    var server = odata('mongodb://localhost/my-app');
    
    server.resource('books', { title: String, price: Number });
    
    server.listen(3000);

## 2.2 Run

Enter the following command to start the OData service:

    $ node index.js

Registers the following routes:

    GET    /books
    GET    /books(:id)
    POST   /books
    PUT    /books(:id)
    DELETE /books(:id)

# 3) Use service

You can use the [REST](http://zh.wikipedia.org/wiki/REST) style HTTP requests for CURD.

## 3.1 Create

Use **POST /resource** to insert new data, it will return to the latest state of the resource.

    $ curl -i -X POST -d '{"title": "title of book", "price": 19.99}' -H "Content-Type: application/json" http://127.0.0.1:3000/books
    HTTP/1.1 201 Created
    Content-Type: application/json; charset=utf-8
    Content-Length: 83
    Date: Sun, 11 Jan 2015 01:46:57 GMT
    Connection: keep-alive

    {
      "title": "title of book",
      "price": 19.99,
      "id": "44cc0da1-7372-43ed-a514-98d5fd6d8498"
    }

## 3.2 Modify

Use **PUT /resource(:id)** to modify existing data, it will return to the latest state of the resource.

    $ curl -i -X PUT -d '{"title": "title of book", "price": 9.99}' -H "Content-Type: application/json" http://127.0.0.1:3000/books(44cc0da1-7372-43ed-a514-98d5fd6d8498)
    HTTP/1.1 200 OK
    Content-Type: application/json; charset=utf-8
    Content-Length: 82
    Date: Sun, 11 Jan 2015 01:50:11 GMT
    Connection: keep-alive

    {
      "title": "title of book",
      "price": 9.99,
      "id": "44cc0da1-7372-43ed-a514-98d5fd6d8498"
    }

## 3.3 Query

Use **GET /resource** to query resources list, result will be returned in the value.

    $ curl -i -X GET http://127.0.0.1:3000/books
    HTTP/1.1 200 OK
    Content-Type: application/json; charset=utf-8
    Content-Length: 94
    Date: Sun, 11 Jan 2015 01:52:49 GMT
    Connection: keep-alive

    {
      "value": [
        {
          "id": "44cc0da1-7372-43ed-a514-98d5fd6d8498",
          "title": "title of book",
          "price": 9.99
        }
      ]
    }

Use **GET /resource(:id)** to querey specific resource.

    $ curl -i -X GET http://127.0.0.1:3000/books(44cc0da1-7372-43ed-a514-98d5fd6d8498)
    HTTP/1.1 200 OK
    Content-Type: application/json; charset=utf-8
    Content-Length: 82
    Date: Sun, 11 Jan 2015 01:54:49 GMT
    Connection: keep-alive

    {
      "id": "44cc0da1-7372-43ed-a514-98d5fd6d8498",
      "title": "title of book",
      "price": 9.99
    }

## 3.4 Remove

Use **DELETE /resource(:id)** to remove specific resource.

    $ curl -i -X DELETE http://127.0.0.1:3000/books(44cc0da1-7372-43ed-a514-98d5fd6d8498)
    HTTP/1.1 200 OK
    Content-Type: text/plain
    Content-Length: 0
    Date: Sun, 11 Jan 2015 01:56:21 GMT
    Connection: keep-alive

# 4) OData Query

This section describes how to use the OData protocol for query data set. Inquiry via a specific URL, you can filtering, sorting, pagination, etc. Each keyword start with  ($) character as a prefix.

Each keyword can be specified only once.

## 4.1 $filter

**$filter** for filter the data set.

Example: Returns a price below $ 10 books list

	http://host/books?$filter=price lt 10.00

node-odata has supported operators:

|| **Operators**    || **Description** || **Example** ||
|| **Comparison Operators** || || ||
|| eq           || Equal                       || genre eq  'Fantasy'      ||
|| ne           || Not equal                 || author ne 'Kevin Kelly' ||
|| gt           || Greater than                || price gt 20             ||
|| ge           || Greater than or equal   || price ge 10             ||
|| lt           || Less than                   || price lt 20            ||
|| le           || Less than or equal      || price le 100            ||
|| **Logical Operators** || || ||
|| and          || Logical and               || Price le 200 and Price gt 3.5 ||

node-odata also built a series of functions to support complex queries:

|| **functions**    || **Example** ||
|| **String Functions** || ||
|| indexof    || indexof(description,'.NET') gt 0 ||
|| **Date Functions** || ||
|| year       || year(publish_date) eq 2000 ||

*Note: More operators and functions will be implemented in the future. All the operators and functions defined in the OData protocol Refer to [here](http://docs.oasis-open.org/odata/odata/v4.0/odata-v4.0-part1-protocol.html#_Toc406398301).

## 4.2 $orderby

**$orderby** for sort by fields.

It can use a comma-separated to multiple sorting.

The expression can include the suffix asc for ascending or desc for descending, separated from the property name by one or more spaces. If asc or desc is not specified, `asc` will be default.

Example: return all Books ordered by publish date in ascending order, then by price in descending order.

	http://host/books?$orderby=publish_date asc, price desc

## 4.3 $top

**$top** for limits the number of items returned from a collection.

Example: return only the first five books of the Books entity set.

	http://host/books?$top=5

## 4.4 $skip

**$skip** for excludes the first n items of the queried collection from the result.

Example: return books starting with the 6th book of the Books entity set

	http://host/books?$skip=6

Where $top and $skip are used together, $skip MUST be applied before $top, regardless of the order in which they appear in the request.

Example: return the third through seventh books of the Books entity set

	http://host/books?$top=5&$skip=2

## 4.5 $select

**$select** for requests that the service return only the properties requested by the client. 

Example:  return title and price of resource only.

	http://host/books?$select=title, price

## 4.6 $count

The **$count** with a value of true specifies that the total count of items within a collection matching the request be returned along with the result.

The **$count** system query option ignores any **$top**, **$skip**, or **$expand** query options, and returns the total count of results across all pages including only those results matching any specified **$filter** and **$search**.

Example: return, along with the results, the total number of books in the collection

	http://host/books?$count=true

## 4.7 $metadata

TODO

# 5) API

This section describes the node-odata **fluent API**.

## 5.1 Resource

Register a Resource in OData service so that it can be using the REST API to invoke.

### Params

params:

|| **Name**                               || **Type**                            || **Details** ||
|| url      || string || URL of Resource ||
|| model    || object || Data structure definitions of Resource ||

### example

**Node**: In addition to the url and model, other parameters are optional

    server.resource('book', {
      // Resource aata structure definitions
      // Optional types: String, Number, Date, Boolean, Array
      author: String,
      description: String,
      genre: String,
      id: String,
      price: Number,
      publish_date: Date,
      title: String
    })
    // configure GET /resource(:id)
    .get()
      .auth(function (req) {...}) // authorization verification, if false, client will get 401
      .before(function (entity) {...}) // before callback
      .after(function (entity) {...}) // after callback
    // configure GET /resource
    .list()
      .auth(function (req) {...})
      .before(function () {...})
      .after(function (data) {...})
    // configure POST /resource
    .post()
      .auth(function (req) {...})
      .before(function (entity) {...})
      .after(function (originEntity, newEntity) {...})
    // configure PUT /resource(:id)
    .put()
      .auth(function (req) {...})
      .before(function (entity) {...})
      .after(function (entity) {...})
    // configure DELETE /resource(:id)
    .delete()
      .auth(function (req) {...})
      .before(function (entity) {...})
      .after(function (entity) {...})
    // configure all of the above request
    .all()
      .auth(function (req) {...})
      .before(function (entity) {...})
      .after(function (entity) {...})
    // 设置 OData Action
    // 第一个参数为 action url, 第二个参数为 callback
    // first param is action url, second param is action's callback
    // when POST /resource(:id)/50-off
    .action('/50off', function(req, res, next){...})
    // default orderby
    .orderBy('date desc') 
    // max skip limit
    .maxSkip(10000) 
    // max top limit
    .maxTop(100)   

## 5.2 Function

Register a WEB API in OData service, for processing custom logic.

    server.get(url, callback, auth);
    server.put(url, callback, auth);
    server.post(url, callback, auth);
    server.delete(url, callback, auth);

### Params

|| **Name**                               || **Type**                            || **Details** ||
|| url      || string || Url of WEB API ||
|| callback  || function || function handler ||
|| auth  || function (optional) || Authorization verification ||

#### Example

  odata.get('/server-time', function(req, res, next) {
      res.json({
        date: new Date()
      });
  });

## 5.3 set / get

Some basic configuration for node-odata.

|| **Allow Key**                               || **Value Type**                            || **Details** ||
|| db      || string || Configure mongoDB database Address ||
|| prefix    || string || Configure the URL prefix, the default is '/' ||
|| maxTop  || int || Setting the global maximum number of allowed Query ||
|| maxSkip  || int || Setting the global maximum number of allowed skipped ||

## 5.4 use

Use `server.use` to add  **Express** middleware.

## 5.5 listen

On a given host and port monitoring requests.

