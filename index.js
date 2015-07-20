
import os from 'os'
import path from 'path'

import koa from 'koa'
import route from 'koa-route'
import parse from 'co-body'

import party from 'level-party'
import sublevel from 'level-sublevel'
import promisify from 'level-promisify'


const app = koa()
const dbpath = process.env.CONNECT_PATH || path.join( os.homedir(), '.level-connect.lev' )
const level = party( dbpath, {
    encoding: 'json'
})
const root = sublevel( level )

function success( res ) {
    return {
        status: 200,
        body: res || {
            body: 'ok'
        }
    }
}

function fail( err ) {
    return {
        status: 500,
        body: {
            body: err.message
        }
    }
}

// Define routes

// Quick header check
app.use( function *( next ) {
    if ( !this.request.headers[ 'x-level-connect' ] ) {
        this.status = 403
        return
    }

    yield next
})

// PUT
app.use( route.post( '/:sublevel/:key', function *( sublevel, key ) {
    let body = yield parse( this )

    try {
        let sub = promisify( root.sublevel( sublevel, {
            encoding: 'json'
        }))
        yield sub.put( key, body )
        Object.assign( this, success() )
    } catch( err ) {
        Object.assign( this, fail( err ) )
    }
}))

// GET
app.use( route.get( '/:sublevel/:key', function *( sublevel, key ) {
    try {
        let sub = promisify( root.sublevel( sublevel, {
            encoding: 'json'
        }))
        let res = yield sub.get( key )
        Object.assign( this, success( res ) )
    } catch( err ) {
        Object.assign( this, fail( err ) )
    }
}))

// DELETE
app.use( route.delete( '/:sublevel/:key', function *( sublevel, key ) {
    try {
        let sub = promisify( root.sublevel( sublevel, {
            encoding: 'json'
        }))
        yield sub.del( key )
        Object.assign( this, success() )
    } catch( err ) {
        Object.assign( this, fail( err ) )
    }
}))


export default app
