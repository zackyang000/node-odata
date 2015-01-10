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


# 1) 安装

node-odata 的运行需要依赖于 [NodeJS](http://nodejs.org/) 和 [MongoDB](http://www.mongodb.org/), 在安装了依赖项之后, 运行以下命令即可:

    $ npm install node-odata


# 2) 运行

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

保存后运行以下命令即可启动 OData 服务:

    $ node index.js
    
它将自动注册以下路由:

    GET    /odata/books
    GET    /odata/books/:id
    POST   /odata/books
    PUT    /odata/books/:id
    DELETE /odata/books/:id

## 2.2 访问服务

你可以使用 REST 风格的 HTTP 请求来对资源进行增删查改操作.

### 新增

### 修改

### 查询

### 删除


# 3) API

## resources.register

## functions.register

## config

# 4) 使用 OData 查询

# 5) 进阶指南

# 6) 已支持的 OData 特性