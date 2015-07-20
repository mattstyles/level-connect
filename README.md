
# level-connect

> Connect to a multi handle sublevel enabled leveldb over http

Uses a newer method from `os` so `iojs version >= 2.3.0` is required

## Party party

The underlying db is a [level-party](https://www.npmjs.com/package/level-party) instance, although it is also [sublevelled](https://www.npmjs.com/package/level-sublevel). This means you can access the db from multiple processes, all on different ports.

```sh
$ CONNECT_PORT=5000 ./bin/start
```

```sh
$ CONNECT_PORT=5001 ./bin/start
```

```sh
$ curl -X POST \
  -H 'X-LEVEL-CONNECT: <client_id>' \
  -H 'Content-Type: application/json' \
  -d '{"foo":"bar"}' \
  localhost:5000/users/foo

> 201 {"body":"ok"}

$ curl -X GET \
  -H 'X-LEVEL-CONNECT: <client_id>' \
  localhost:5001/users/foo

> 200 {"foo":"bar"}

$ curl -X DELETE \
  -H 'X-LEVEL-CONNECT: <client_id>' \
  localhost:5001/users/foo

> 200 {"body":"ok"}

$ curl -X GET \
  -H 'X-LEVEL-CONNECT: <client_id>' \
  localhost:5001/users/foo

> 404 {"foo":"bar"}

```
