
import os from 'os'
import path from 'path'

import koa from 'koa'
import route from 'koa-route'
import parse from 'co-body'
import denodeify from 'denodeify'

import party from 'level-party'
import sublevel from 'level-sublevel'
import promisify from 'level-promisify'


const app = koa()
const dbpath = process.env.CONNECT_PATH || path.join( os.homedir(), '.level-connect.lev' )
const level = party( dbpath, {
    encoding: 'json'
})
const root = sublevel( level )

function success() {
    return {
        status: 200,
        body: {
            body: 'ok'
        }
    }
}

function fail( err ) {
    return {
        status: 500,
        body: {
            body: err
        }
    }
}

// Define routes

app.use( function *( next ) {
    if ( !this.request.headers[ 'x-level-connect' ] ) {
        this.status = 403
        return
    }

    yield next
})

app.use( route.post( '/root/:key', function *( key ) {
    let body = yield parse( this )

    try {
        yield promisify( root ).put( key, body )
        Object.assign( this, success() )
    } catch( err ) {
        Object.assign( this, fail( err ) )
    }
}))


export default app
