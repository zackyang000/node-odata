Migrating from 0.6 to 0.7
===================

## URL
Modify url of resource to standard format. from `/resource/:id` to `/resource(:id)`.

Before:

```
GET    /odata/books
GET    /odata/books/:id
POST   /odata/books
PUT    /odata/books/:id
DELETE /odata/books/:id
```

After:

```
GET    /odata/books
GET    /odata/books(:id)
POST   /odata/books
PUT    /odata/books(:id)
DELETE /odata/books(:id)
```

## Resource register
To simplify api, resource register change to **fluent API**. (see [detail](http://tossshinhwa.github.io/node-odata/en/#5-api))

Before:

```
server.resources.register({
    url: '/books',
    model: {
        title: String,
        price: Number
    }
});
```

After:

```
server.resource('books', { title: String, price: Number });
```

## Fcuntion register
To simplify api, adjusted for function register: Remove the original api `server.functions.register`, add 4 new API: `get`, `post`, `put` and `delete`.

Before:

```
odata.functions.register({
'/server-time',
method: 'GET',
handle: function(req, res, next) {
  res.json({
    date: new Date()
  });
}
```

After:

```
server.get('/server-time', function(req, res, next) {
  res.json({
    date: new Date()
  });
});
```

## Configuration
To simplify api, adjusted for how to set/get configuration.

Before:

```
server.config.set('maxTop', 1000);

server.config.get('maxTop');
```

After:

```
server.set('maxTop', 1000);

server.get('maxTop');
```
