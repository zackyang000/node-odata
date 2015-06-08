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

After `node-odata` installation is complete, create * index.js * file and enter the following code:

    var odata = require('node-odata');

    var server = odata('mongodb://localhost/my-app');

    server.resources.register({
        url: '/books',
        model: {
            title: String,
            price: Number
        }
    });

    server.listen(3000);

## 2.2 Run

Enter the following command to start the OData service:

    $ node index.js

Registers the following routes:

    GET    /odata/books
    GET    /odata/books/:id
    POST   /odata/books
    PUT    /odata/books/:id
    DELETE /odata/books/:id

# 3) Use service

You can use the [REST](http://zh.wikipedia.org/wiki/REST) style HTTP requests for CURD.

## 3.1 Create

Use `POST /odata/resource` to insert new data, it will return to the latest state of the resource.

    $ curl -i -X POST -d '{"title": "title of book", "price": 19.99}' -H "Content-Type: application/json" http://127.0.0.1:3000/odata/books
    HTTP/1.1 201 Created
    Content-Type: application/json; charset=utf-8
    Content-Length: 97
    Date: Sun, 11 Jan 2015 01:46:57 GMT
    Connection: keep-alive

    {
      "__v": 0,
      "title": "title of book",
      "price": 19.99,
      "_id": "54b1d6117d0b3d6d5255bc30"
    }

## 3.2 Modify

Use `PUT /odata/resource/:id` to modify existing data, it will return to the latest state of the resource.

    $ curl -i -X PUT -d '{"title": "title of book", "price": 9.99}' -H "Content-Type: application/json" http://127.0.0.1:3000/odata/books/54b1d6117d0b3d6d5255bc30
    HTTP/1.1 200 OK
    Content-Type: application/json; charset=utf-8
    Content-Length: 96
    Date: Sun, 11 Jan 2015 01:50:11 GMT
    Connection: keep-alive

    {
      "_id": "54b1d6117d0b3d6d5255bc30",
      "title": "title of book",
      "price": 9.99,
      "__v": 0
    }

## 3.3 Query

Use `GET /odata/resource` to query resources list, result will be returned in the value.

    $ curl -i -X GET http://127.0.0.1:3000/odata/books
    HTTP/1.1 200 OK
    Content-Type: application/json; charset=utf-8
    Content-Length: 402
    Date: Sun, 11 Jan 2015 01:52:49 GMT
    Connection: keep-alive

    {
      "value": [
        {
          "_id": "54b1d6117d0b3d6d5255bc30",
          "title": "title of book",
          "price": 9.99,
          "__v": 0
        }
      ]
    }

Use `GET /odata/resource/:id` to querey specific resource.

    $ curl -i -X GET http://127.0.0.1:3000/odata/books/54b1d6117d0b3d6d5255bc30
    HTTP/1.1 200 OK
    Content-Type: application/json; charset=utf-8
    Content-Length: 96
    Date: Sun, 11 Jan 2015 01:54:49 GMT
    Connection: keep-alive

    {
      "_id": "54b1d6117d0b3d6d5255bc30",
      "title": "title of book",
      "price": 9.99,
      "__v": 0
    }

## 3.4 Remove

Use `DELETE /odata/resource/:id` to remove specific resource.

    $ curl -i -X DELETE http://127.0.0.1:3000/odata/books/54b1d6117d0b3d6d5255bc30
    HTTP/1.1 200 OK
    Content-Type: text/plain
    Content-Length: 2
    Date: Sun, 11 Jan 2015 01:56:21 GMT
    Connection: keep-alive

    OK

# 4) OData Query

This section describes how to use the OData protocol for query data set. Inquiry via a specific URL, you can filtering, sorting, pagination, etc. Each keyword start with  ($) character as a prefix.

Each keyword can be specified only once.

## 4.1 $filter

`$filter` for filter the data set.

Example: Returns a price below $ 10 books list

	http://host/odata/books?$filter=price lt 10.00

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

*Note: More operators and functions will be implemented in the future. All the operators and functions defined in the OData protocol Refer to [here](http://docs.oasis-open.org/odata/odata/v4.0/errata02/os/complete/part1-protocol/odata-v4.0-errata02-os-part1-protocol-complete.html#_Toc406398301).

## 4.2 $orderby

`$orderby` for sort by fields.

It can use a comma-separated to multiple sorting.

The expression can include the suffix asc for ascending or desc for descending, separated from the property name by one or more spaces. If asc or desc is not specified, `asc` will be default.

Example: return all Books ordered by publish date in ascending order, then by price in descending order.

	http://host/odata/books?$orderby=publish_date asc, price desc

## 4.3 $top

`$top` for limits the number of items returned from a collection.

Example: return only the first five books of the Books entity set.

	http://host/odata/books?$top=5

## 4.4 $skip

`$skip` for excludes the first n items of the queried collection from the result.

Example: return books starting with the 6th book of the Books entity set

	http://host/odata/books?$skip=6

Where $top and $skip are used together, $skip MUST be applied before $top, regardless of the order in which they appear in the request.

Example: return the third through seventh books of the Books entity set

	http://host/odata/books?$top=5&$skip=2

## 4.5 $count

The `$count` with a value of true specifies that the total count of items within a collection matching the request be returned along with the result.

The $count system query option ignores any $top, $skip, or $expand query options, and returns the total count of results across all pages including only those results matching any specified $filter and $search.

Example: return, along with the results, the total number of books in the collection

	http://host/odata/books?$count=true

## 4.6 metadata

TODO

# 5) API

This section describes the node-odata APIs.

## 5.1 odata.resources.register

Register a Resource in OData service so that it can be using the REST API to invoke.

### Params

params:

|| **Name**                               || **Type**                            || **Details** ||
|| url      || string || URL of Resource ||
|| model    || object || Data structure definitions of Resource ||
|| rest     || object (optional) || configuration for REST API, see example ||
|| actions  || object (optional) || configuration for OData Action ([What's the Action](http://docs.oasis-open.org/odata/odata/v4.0/os/part1-protocol/odata-v4.0-os-part1-protocol.html#_Actions_1)), see example ||
|| options  || object (optional) || Setting default behavior of REST API, such as the maximum number of queries, default ordering, etc. see example ||

### example

*Node: In addition to the url and model, other parameters are optional

  odata.resources.register({
    // Resource URL register to /book
    url: 'book',

    // Resource aata structure definitions
    // Optional types: String, Number, Date, Boolean, Array
    model: {
      author: String,
      description: String,
      genre: String,
      id: String,
      price: Number,
      publish_date: Date,
      title: String
    },

    // configuration for REST API
    rest: {
      // When GET /resource/:id
      get: {
        // Authorization verification, if false, client will get 401
        auth: function (req) {},

        // before handle
        before: function (req, res) {},

        //after handle
        after: function (entity) {}
      },

      // When GET /resource
      getAll: {
        // same as get
      },

      post: {
        // same as get
      },

      put: {
        // same as get
      },

      del: {
        // same as get
      }
    },

    // configuration for OData Action
    actions: {
      // key is action url, value is action's handle
      // Here registered a 50-off to deal with the price of the book was revised to half
      // when POST /resource/:id/50-off
      "50-off": function(req, res, next) {
        repository = mongoose.model('books');
        repository.findById(req.params.id, function(err, book){
          book.price = +(book.price / 2).toFixed(2);
          book.save(function(err){
            res.jsonp(book);
          });
        });
      }
    }

    // Setting default behavior
    options: {
      orderby: 'date desc',
      maxSkip: 10000,
      maxTop: 100
    }
  });


## 5.2 odata.functions.register

Register a WEB API in OData service, for processing custom logic.

### Params

|| **Name**                               || **Type**                            || **Details** ||
|| url      || string || Url of WEB API ||
|| method    || ["POST", "PUT", "GET", "DELETE"] || Request method ||
|| handle  || function || handle ||
|| auth  || function (optional) || Authorization verification ||

#### Example

  odata.functions.register({
    // Url of WEB API
    // Here registers a URL '/ server-time' for getting server time
    url: '/server-time',

    // HTTP Method of WEB API
    // Accepted values include: "POST", "PUT", "GET", "DELETE"
    method: 'GET',

    // Business logic
    handle: function(req, res, next) {
      return res.json({
        date: new Date()
      });
    }
  });

#### Simplify API

You can also use the following API to register

   odata.get(url, handle, auth);
   odata.put(url, handle, auth);
   odata.post(url, handle, auth);
   odata.del(url, handle, auth);


## 5.3 odata.config.set / odata.config.get

Some basic configuration for node-odata.

|| **Allow Key**                               || **Value Type**                            || **Details** ||
|| db      || string || Configure mongoDB database Address ||
|| prefix    || string || Configure the URL prefix, the default is '/ odata' ||
|| maxTop  || int || Setting the global maximum number of allowed Query ||
|| maxSkip  || int || Setting the global maximum number of allowed skipped ||

## 5.4 odata.use

Use `odata.use` to add` Express` middleware.

## 5.5 odata.listen

On a given host and port monitoring requests.

