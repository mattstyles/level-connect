
# level-connect

> Connect to a multi handle sublevel enabled leveldb over http

## Getting Started

Level-connect doesn’t really care whether it is global or not, but the easiest way (although probably least useful) to get started is to install it globally

```sh
npm i -g level-connect
```

Control the server instance with environment variables and fire it up

```sh
$ CONNECT_PORT=5000 connect
```

Logs use [bunyan](https://github.com/trentm/node-bunyan) so any of the tooling should let you inspect the logs.

## Party party

The underlying db is a [level-party](https://www.npmjs.com/package/level-party) instance, although it is also [sublevelled](https://www.npmjs.com/package/level-sublevel). This means you can access the db from multiple processes, all on different ports.

```sh
$ CONNECT_PORT=5000 ./bin/connect
```

```sh
$ CONNECT_PORT=5001 ./bin/connect
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


## API

Control the server instance with environment variables

### CONNECT_PORT <Integer>

_default_ `5000`

The port to attach to

### CONNECT_PATH <String>

_default_ `HOME/.level-connect.lev`

The path to the db to connect to

### DEBUG <Boolean>

_default_ `false`

If true will whack out some extra logs


## HTTP API

### Negotiating the handshake

Level-connect implements a fairly crude token based authentication model using custom headers. To grab a new token use `/new`

### POST /new

```sh
$ curl -i -X POST -H 'X-LEVEL-CONNECT: new' host:port/new

201
{"id":"ID-STRING"}
```

The id token should be used in the `X-LEVEL-CONNECT` header for all subsequent requests.

Tokens stay fresh for 3 days and are refreshed with each use.

### POST /:sublevel/:key

Puts a single value into a specific sublevel at key

```sh
$ curl -i -X POST \
  -H 'X-LEVEL-CONNECT: <id>' \
  -H 'Content-Type: application/json' \
  -d '{"name":"Josh","scopes":"user"}'
  host:port/users/josh

201
{"body":"OK"}
```

### GET /:sublevel/:key

Grabs a single value from sublevel at key

```sh
$ curl -i -X GET \
  -H 'X-LEVEL-CONNECT: <id>' \
  host:port/users/josh

200
{"name":"Josh","scopes":"user"}
```

### DELETE /:sublevel/:key

Deletes a single value from sublevel at key

```sh
$ curl -i -X DELETE \
  -H 'X-LEVEL-CONNECT: <id>' \
  host:port/users/josh

204
```

### POST /:sublevel

Batches many values to the sublevel

```sh
$ curl -i -X POST \
  -H 'X-LEVEL-CONNECT: <id>' \
  -H 'Content-Type: application/json' \
  -d '[{"name":"Josh","scopes":"user"},{"name":"Jane","scopes":"admin"}]'
  host:port/users

201
{"body":"OK"}
```

### GET /:sublevel

Streams many values from the sublevel

```sh
$ curl -i -X GET \
  -H 'X-LEVEL-CONNECT: <id>' \
  host:port/users

200
{"name":"Josh","scopes":"user"}
{"name":"Jane","scopes":"admin"}
```
