---
title: node-odata Documentation
markdown2extras: wiki-tables
---

# 关于 node-odata

node-odata 可以让你轻松创建 REST API, 并能使用 [OData](http://www.odata.org/) 协议对资源进行的查询. 它能让你以极简的方式来创建 API 服务, 使你更专注于业务逻辑的处理.

## 什么是 OData 协议?

OData 全名"开放数据协议(Open Data Protocol)", 是一个用于 web 的数据访问协议. OData 提供了一个统一的 CRUD (create, read, update, and delete) 操作来查询和维护数据集.

## 为什么使用 node-odata?

node-odata 同时结合了 OData 强大的数据查询能力以及 NodeJS 支持高并发的优势, 使开发者能快速的创建一个高性能并支持各种复杂查询的 REST API.

在常规的 REST 框架中, 其只提供了 REST 风格的 CRUD 操作. 开发者不得不对每一个资源都手动添加一些公共功能, 如排序/分页等. 甚至在多数复杂的业务场景中, 开发者需要一次次根据业务需求定制出特定的复杂查询 API, 这都极大的浪费了人力资源. OData数据访问协议很好的解决了这一问题. 它定义了$filter, $orderby, $select等一系列关键字来进行统一的筛选, 排序, 分页等操作. 极大的减轻了开发者的负担, 提高了生产力.

反观 OData 社区, 目前 node-odata 是唯一一款基于 NodeJS 的服务端 OData 框架. 与其它编译型语言的 OData 实现相比, 它运行更加高效, 部署更加方便, 编写更加简单 (4行代码即可初始化一个 OData 服务).

## 当前状态

node-odata 当前处于测试版中, 它是稳定的但并不完整. node-odata 基于 CoffeeScript 编写. 它目前需要依赖特定数据库: MongoDB. 当前的目标是完成 OData 协议中得所有特性, 然后制作链接到其它数据库的 Adapter.

# 1) 安装

node-odata 的运行需要依赖于 [NodeJS](http://nodejs.org/) 和 [MongoDB](http://www.mongodb.org/), 在安装了依赖项之后, 运行以下命令即可:

    $ npm install node-odata


# 2) 快速开始

这里我们讲创建并运行一个最简单的 OData 服务.

## 2.1 创建服务

`node-odata` 安装完成后, 新建 *index.js* 文件并输入以下脚本:

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

## 2.2 运行服务

保存后输入以下命令即可启动 OData 服务:

    $ node index.js

它将自动注册以下路由:

    GET    /odata/books
    GET    /odata/books/:id
    POST   /odata/books
    PUT    /odata/books/:id
    DELETE /odata/books/:id

# 3) 使用服务

你可以使用 [REST](http://zh.wikipedia.org/wiki/REST) 风格的 HTTP 请求来对资源进行增删查改操作.

## 3.1 新增

使用 `POST /odata/resource` 插入新的数据, 他将返回 resource 的最新状态.

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

## 3.2 修改

使用 `PUT /odata/resource/:id` 修改已有的数据, 他将返回 resource 修改后的状态.

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

## 3.3 查询

使用 `GET /odata/resource` 查询 resource 列表, 其结果将以数组的形式将返回在 value 对象中.

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

使用 `GET /odata/resource/:id` 查询特定 resource.

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

## 3.4 删除

使用 `DELETE /odata/resource/:id` 删除指定 resource.

    $ curl -i -X DELETE http://127.0.0.1:3000/odata/books/54b1d6117d0b3d6d5255bc30
    HTTP/1.1 200 OK
    Content-Type: text/plain
    Content-Length: 2
    Date: Sun, 11 Jan 2015 01:56:21 GMT
    Connection: keep-alive

    OK

# 4) OData 查询

本节讲介绍如何使用 OData 协议进行数据集的查询. 查询是通过一个特定的 URL 来进行的, 你可以对数据集进行如 过滤, 排序, 分页等. 每个关键字都有相同的 ($) 字符作为前缀.

每个关键字只能指定一次.

## 4.1 $filter

`$filter` 关键字可以对返回的数据集进行筛选.

如: 返回价格低于 10 元的书单列表

	http://host/odata/books?$filter=price lt 10.00

下方表格中列出了 node-odata 已支持的操作符:

|| **操作符**    || **描述** || **列子** ||
|| **比较操作符** || || ||
|| eq           || 等于 (Equal)                       || genre eq  'Fantasy'      ||
|| ne           || 不等于 (Not equal)                 || author ne 'Kevin Kelly' ||
|| gt           || 大于 (Greater than)                || price gt 20             ||
|| ge           || 大于等于 (Greater than or equal)   || price ge 10             ||
|| lt           || 小于 (Less than)                   || price lt 20            ||
|| le           || 小于等于 (Less than or equal)      || price le 100            ||
|| **逻辑操作符** || || ||
|| and          || 逻辑与 (Logical and)               || Price le 200 and Price gt 3.5 ||

node-odata 还内置了一些函数, 用于支持复杂查询. 如下表所示:

|| **函数**    || **列子** ||
|| **字符串函数** || ||
|| indexof    || indexof(description,'.NET') gt 0 ||
|| **日期函数** || ||
|| year       || year(publish_date) eq 2000 ||

*Note: 更多地操作符和函数将在未来实现. OData 协议中定义的所有操作符和函数请参考[这里](http://docs.oasis-open.org/odata/odata/v4.0/errata02/os/complete/part1-protocol/odata-v4.0-errata02-os-part1-protocol-complete.html#_Toc406398301).

## 4.2 $orderby

`$orderby` 关键字可以使返回的数据依据集合中特定字段进行排序.

他可以使用逗号分隔以实现多重排序.

表达式可以以 `asc` 或 `desc` 结尾用于表示升序或降序. 如果不提供, 默认则为 `asc`.

如: 根据书的发行日期从老到新排序, 然后在根据书的价格从高到低排序.

	http://host/odata/books?$orderby=publish_date asc, price desc

## 4.3 $top

`$top` 关键字用于限制返回集合的条数.

如: 从书单中返回前5本书

	http://host/odata/books?$top=5

## 4.4 $skip

`$skip` 关键字用于排除结果中的前 n 条记录, 返回的数据集将从第 n+1 条的位置开始.

如: 返回书单中第6条和第6条以后的数据

	http://host/odata/books?$skip=6

当 $top 和 $skip 同时使用时, 无论它们在 URL 中的顺序如何, $skip 总是会优先执行. 你可以用它们实现分页功能.

如: 返回第3到第7条数据

	http://host/odata/books?$top=5&$skip=2

## 4.5 $count

当指定 `$count` 关键字的值为 `true` 的时候, 它将返回当前查询数据集的总条数.

`$count` 关键字将忽略 `$top` 和 `skip` 的过滤条件, 它的结果只受 `$filter` 的影响.

如: 返回书单列表, 并包含总条数数量

	http://host/odata/books?$count=true

## 4.6 metadata

为了更方便的让客户端调用, node-odata 实现了一套非标准的 metadata 特性. 可以让客户端通过 URL 就能了解到 OData 服务中 Resource 的数据结构.

|| **URL**                               || **描述**                            ||
|| http://host/odata/                    || 列出当前 OData 服务所有可用的 Resource ||
|| http://host/odata/__metadata          || 列出所有 Resource 的数据结构          ||
|| http://host/odata/__metadata/resource || 列出指定 Resource 的数据结构          ||

如:

    $ curl -i -X GET http://127.0.0.1:3000/odata/__metadata/books
    HTTP/1.1 200 OK
    Content-Type: application/json; charset=utf-8
    Content-Length: 65
    Date: Sun, 11 Jan 2015 08:41:44 GMT
    Connection: keep-alive

    {
      "books": {
        "title": "String",
        "price": "Number"
      }
    }

# 5) API

本节讲介绍 node-odata 提供的 API.

## 5.1 odata.resources.register

在 OData 服务中注册一个 Resource, 使其可以使用基于 OData 的 REST API 进行增删查改.

### 参数

params: 复杂对象, 具体字段如下所示:

|| **Name**                               || **Type**                            || **Details** ||
|| url      || string || Resource 的 URL 地址 ||
|| model    || object || Resource 的数据结构定义 ||
|| rest     || object (optional) || 针对 REST API 的配置项, 详见 example ||
|| actions  || object (optional) || 配置 OData Action ([什么是 Action](http://docs.oasis-open.org/odata/odata/v4.0/os/part1-protocol/odata-v4.0-os-part1-protocol.html#_Actions_1)), 用于实现复杂请求, 详见 example ||
|| options  || object (optional) || 设置 REST API 的默认行为, 如最大查询条数/默认排序方式等, 详见 example ||

### example

*注意: 除了 url 和 model 以外, 其它都是可选参数

  odata.resources.register({
    // Resource URL注册为 /book
    url: 'book',

    // Resource 的数据结构定义
    // 可选类型包括: String, Number, Date, Boolean, Array
    model: {
      author: String,
      description: String,
      genre: String,
      id: String,
      price: Number,
      publish_date: Date,
      title: String
    },

    // 针对 REST API 的配置项
    rest: {
      // 当进行 GET /resource/:id 获取特定资源时时:
      get: {
        // 授权验证, 若返回 false, 则客户端将得到 401
        auth: function (req) {},

        // 在请求之前的 handle (同步, 将阻塞请求)
        before: function (req, res) {},

        //在请求完成之后的 handle (异步, response 返回后继续执行)
        after: function (entity) {}
      },

      // 在进行 GET /resource 获取资源列表时:
      getAll: {
        // 授权验证, 若返回 false, 则客户端将得到 401
        auth: function (req) {},

        // 在请求之前的 handle (同步, 将阻塞请求)
        before: function (req, res) {},

        //在请求完成之后的 handle (异步, response 返回后继续执行)
        after: function (entities) {}
      },

      post: {
        // 授权验证, 若返回 false, 则客户端将得到 401
        auth: function (req) {},

        // 在请求之前的 handle (同步, 将阻塞请求)
        before: function (req, res) {},

        //在请求完成之后的 handle (异步, response 返回后继续执行)
        after: function (entity) {}
      },

      put: {
        // 授权验证, 若返回 false, 则客户端将得到 401
        auth: function (req) {},

        // 在请求之前的 handle (同步, 将阻塞请求)
        before: function (req, res) {},

        //在请求完成之后的 handle (异步, response 返回后继续执行)
        after: function (newEntity, oldEntity) {}
      },

      del: {
        // 授权验证, 若返回 false, 则客户端将得到 401
        auth: function (req) {},

        // 在请求之前的 handle (同步, 将阻塞请求)
        before: function (req, res) {},

        //在请求完成之后的 handle (异步, response 返回后继续执行)
        after: function () {}
      }
    },

    // 配置 OData Action
    actions: {
      // key 为 action url, value 是该 action 的 handle
      // 这里注册了一个 50-off 来处理将书的价格修改为半价
      // 请求方式为 POST /resource/:id/50-off
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

    // 设置 REST API 的默认行为
    options: {
      // 默认排序字段, 默认为 undefined
      orderby: 'date desc'

      // 最大允许跳过的行数, 默认为不限制
      maxSkip: 10000

      // 最大允许一次返回的条数, 默认为不限制
      maxTop: 100
    }
  });


## 5.2 odata.functions.register

在 OData 中注册一个 WEB API, 用于处理自定义的逻辑.

### 参数

|| **Name**                               || **Type**                            || **Details** ||
|| url      || string || WEB API 的 URL 地址 ||
|| method    || ["POST", "PUT", "GET", "DELETE"] || 请求方式 ||
|| handle  || function || 具体处理逻辑 ||
|| auth  || function (optional) || 权限验证 ||

#### Example

  odata.functions.register({
    // WEB API 的 URL
    // 这里注册了一个 URL '/server-time' 用于获取服务器时间
    url: '/server-time',

    // WEB API 的 HTTP Method
    // 接受的值包括: "POST", "PUT", "GET", "DELETE"
    method: 'GET',

    // 具体业务逻辑处理
    handle: function(req, res, next) {
      return res.json({
        date: new Date()
      });
    }
  });

#### 简化的 API

您也可以使用简化后的 API 达到相同效果:

   odata.get(url, handle, auth);
   odata.put(url, handle, auth);
   odata.post(url, handle, auth);
   odata.del(url, handle, auth);


## 5.3 odata.config.set / odata.config.get

用于对 node-odata 进行一些基本配置.

|| **Allow Key**                               || **Value Type**                            || **Details** ||
|| db      || string || 重新配置 mongoDB 数据库地址 ||
|| prefix    || string || 重新配置 URL 前缀, 默认为 '/odata' ||
|| maxTop  || int || 设置全局最大允许查询的条数, 可以被 Resource 的设置覆盖 ||
|| maxSkip  || int || 设置全局最大允许跳过的条数, 可以被 Resource 的设置覆盖 ||


# 6) 进阶指南

## 6.1 Express 中间件支持

使用 `odata.use` 添加中间件.

## 6.2 构建复杂的 Resource

## 6.3 隐藏指定字段

## 6.4 权限验证

## 6.5 错误处理

## 6.6 日志记录

## 6.7 高级查询

# 7) 尚未支持的 OData 特性列表

