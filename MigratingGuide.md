Migrating from 0.6 to 0.7
===================
1. `server.resource.register(params)` change to `server.register(params)`.
2. `server.functions.register(params)` change to `server.get(url, callback)`, `server.put(url, callback)`, `server.post(url, callback)` and `server.delete(url, callback)`.
3. `server.config.set` change to `server.set`.
3. `server.config.get` change to `server.get`.
