
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


// Define routes

// Quick header check
app.use( function *( next ) {
    if ( !this.request.headers[ 'x-level-connect' ] ) {
        this.status = 403
        return
    }

    this.xClient = this.request.headers[ 'x-level-connect' ]
    yield next
})


// Make independent handlers for each request
app.use( function *( next ) {
    this.onSuccess = function( res ) {
        console.log( 'success', this.xClient, '200' )
        return {
            status: 200,
            body: res || {
                body: 'ok'
            }
        }
    }

    this.onFail = function( err ) {
        console.log( 'error', this.xClient, err.message )
        return {
            status: err.notFound ? 404 : 500,
            body: {
                body: err.message
            }
        }
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
        Object.assign( this, this.onSuccess() )
    } catch( err ) {
        Object.assign( this, this.onFail( err ) )
    }
}))

// GET
app.use( route.get( '/:sublevel/:key', function *( sublevel, key ) {
    try {
        let sub = promisify( root.sublevel( sublevel, {
            encoding: 'json'
        }))
        let res = yield sub.get( key )
        Object.assign( this, this.onSuccess( res ) )
    } catch( err ) {
        Object.assign( this, this.onFail( err ) )
    }
}))

// DELETE
app.use( route.delete( '/:sublevel/:key', function *( sublevel, key ) {
    try {
        let sub = promisify( root.sublevel( sublevel, {
            encoding: 'json'
        }))
        yield sub.del( key )
        Object.assign( this, this.onSuccess() )
    } catch( err ) {
        Object.assign( this, this.onFail( err ) )
    }
}))


export default app
