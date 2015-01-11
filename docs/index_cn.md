---
title: node-odata Documentation
---

# 关于 node-odata

node-odata 可以让你创建 REST API, 并能使用 [OData](http://www.odata.org/) 协议的查询格式进行数据的筛选. 让你可以更方便的创建 API, 更专注于业务逻辑.

## 什么是 OData 协议?

OData 全称开放数据协议(Open Data Protocol), 是一个用于 web 的数据访问协议. OData 提供了一个统一的 CRUD (create, read, update, and delete) 操作来查询和维护数据集.

## 为什么使用 node-odata?

node-odata 同时结合了 OData 强大的数据查询能力以及 NodeJS 高并发能力的优势, 使开发者能快速的创建一个高性能并支持各种复杂查询的 REST API. 

在常规的 REST 框架中, 仅仅提供了 REST 风格的 CRUD 操作. 开发者不的不对每一个资源都手动添加一些公共功能, 如排序/分页等, 甚至在复杂的业务场景中, 开发者不的不一次次根据业务需求制定一些特定的复杂查询, 这都极大的浪费了人力资源. OData数据访问协议很好的解决了这一问题. 它定义了$filter, $orderby, $select等一系列关键字来进行统一的筛选, 排序, 分页等操作. 极大的减轻了开发者的负担, 提高了生产力.

反观 OData 社区, 目前 node-odata 是唯一一款基于 NodeJS 的 OData 实现. 与其它编译型语言的 OData 实现相比, 它运行更加高效, 部署更加方便, 编写更加简单 (最短只需3行代码即可初始化一个 OData 服务).

## 当前状态

node-odata 当前处于测试版中, 它是稳定的但并不完整. node-odata 基于 CoffeeScript 编写. 它目前需要依赖特定数据库: MongoDB. 当前的目标是完成 OData 协议中得所有特性, 然后制作链接到其它数据库的 Adapter.

# 1) 安装

node-odata 的运行需要依赖于 [NodeJS](http://nodejs.org/) 和 [MongoDB](http://www.mongodb.org/), 在安装了依赖项之后, 运行以下命令即可:

    $ npm install node-odata


# 2) 快速开始

这里我们讲创建并运行一个最简单的 OData 服务.

## 2.1 创建服务

安装完成后, 新建 *index.js* 文件并输入:

    var odata = require('node-odata');

    odata.set('db', 'mongodb://localhost/my-app');

    odata.resources.register({
        url: '/books',
        model: {
            title: String,
            price: Number
        }
    });

    odata.listen(3000);

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

## 4.1 $filter

## 4.2 $filter 进阶

## 4.3 $top

## 4.4 $skip

## 4.5 $orderby

## 4.6 metadata

# 5) API

## 5.1 resources.register

## 5.2 functions.register

## 5.3 config

# 6) 进阶指南

## 6.1 构建复杂的 Resource

## 6.2 隐藏特定字段

## 6.3 权限验证

## 6.4 错误处理

## 6.5 日志记录

# 7) 尚未支持的 OData 特性