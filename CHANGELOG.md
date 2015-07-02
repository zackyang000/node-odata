# 0.7.0
===================
- Improved regist resource's API.
- Add `enableOdataSyntax` in setting for use `/resource(:id)/` url. ([#2](https://github.com/TossShinHwa/node-odata/issues/2))
- Fix function named `before` of resource will not be execute. ([#31](https://github.com/TossShinHwa/node-odata/issues/31))

# 0.6.0 (2015-05-30)
===================
- **Convert project language from CoffeeScript to ECMAScript6.**
- Default support cors. ([#16](https://github.com/TossShinHwa/node-odata/issues/16))
- Allow put to create entity. ([#18](https://github.com/TossShinHwa/node-odata/issues/18))

# 0.5.0 (2015-05-08)
===================
- Add detail links for metadata info.
- Change API: server.get/set -> server.config.get/set
- Add simple API for functions. ([#7](https://github.com/TossShinHwa/node-odata/issues/7))

# 0.4.0 (2015-04-09)
===================
- Optimized initialization method: odata -> odata()
- Fix maxTop and maxSkip of global-limit in options is not work. ([#14](https://github.com/TossShinHwa/node-odata/issues/14))

# 0.3.0 (2015-01-20)
===================
- Support the use of complex objects to define resource.
- Remove mongoose field: `__v`. ([#6](https://github.com/TossShinHwa/node-odata/issues/6))
- Edit field `_id` to `id`. ([#5](https://github.com/TossShinHwa/node-odata/issues/5))
- Fix build-in query function's keyword can't use in field of resource or get error when this field. ([#9](https://github.com/TossShinHwa/node-odata/issues/9))

# 0.2.0 (2015-01-04)
## Features
- Improved regist resource's API.
- Wrap 'Express' module.

# 0.1.0 (2014-10-16)
===================
- OData query supported more keywords include: `$count`.
- $filter supported more keywords include: `indexof`, `year`.
- Added example.
- Added test case.

# 0.0.1 (2014-10-05)
===================
- Full CRUD supported.
- OData query supported keywords include: `$filter`, `$select`, `$top`, `$skip`, `$orderby`.
- $filter supported keywords include: `eq`, `ne`, `lt`, `le`, `gt`, `ge`, `and`.
