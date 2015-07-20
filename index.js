
import os from 'os'
import path from 'path'

import koa from 'koa'
import route from 'koa-route'
import parse from 'co-body'

import bunyan from 'bunyan'
import uuid from 'node-uuid'

import party from 'level-party'
import sublevel from 'level-sublevel'
import promisify from 'level-promisify'

// App stuff
const app = koa()
const dbpath = process.env.CONNECT_PATH || path.join( os.homedir(), '.level-connect.lev' )
const level = party( dbpath, {
    encoding: 'json'
})
const root = sublevel( level )
const clients = promisify( root.sublevel( 'x-client', {
    encoding: 'json'
}))
const TOKEN_REQUEST_URL = '/new'
const TOKEN_STALE = 60 * 60 * 24 * 3 // 3 days

// Logger stuff
const log = bunyan.createLogger({
    name: 'level-connect'
})

if ( process.env.DEBUG ) {
    log.level( 'debug' )
}



// Client handshake
app.use( function *( next ) {
    let onForbidden = ( err ) => {
        log.warn( '403', this.request.ip, this.request.header[ 'user-agent' ], this.request.method, this.request.url )
        this.status = 403

        if ( err ) {
            log.error( err )
            this.body = {
                body: err
            }
        }
    }

    // Let through the token request route
    if ( this.request.url === TOKEN_REQUEST_URL ) {
        yield next
        return
    }

    if ( !this.request.headers[ 'x-level-connect' ] ) {
        onForbidden()
        return
    }

    // Check the client is registered
    let clientID = this.request.headers[ 'x-level-connect' ]
    try {
        // Grab the token and make sure it is still fresh
        let res = yield clients.get( clientID )
        if ( !res.active ) {
            throw new Error( 'Token inactive. Try requesting a new one.' )
        }

        // Check token should not be stale
        if ( Date.now() - res.timestamp > TOKEN_STALE ) {
            yield clients.put( clientID, Object.assign( res, {
                active: false
            }))
            throw new Error( 'Token stale. Try requesting a new one.' )
        }

        // Freshen the timestamp
        yield clients.put( clientID, Object.assign( res, {
            timestamp: Date.now()
        }))

        this.xClient = clientID
        yield next
    } catch( err ) {
        onForbidden( err.message )
        return
    }
})


// Make independent handlers for each request
app.use( function *( next ) {
    this.onSuccess = function( res ) {
        let status = 200

        log.info( this.xClient, this.request.method, this.request.url, 'OK', this.request.ip )
        log.debug( JSON.stringify( this.request ) )

        return {
            status: status,
            body: res || {
                body: 'ok'
            }
        }
    }

    this.onFail = function( err ) {
        let status = err.notFound ? 404 : 500

        log.error( this.xClient, this.request.method, this.request.url, status, this.request.ip, err.message )
        log.debug( JSON.stringify( this.request ) )
        log.debug( err )

        return {
            status: status,
            body: {
                body: err.message
            }
        }
    }

    yield next
})


// Define routes

/**
 * Client register
 * @example client Object
 * {
 *   // Denotes if the token is currently active
 *   // Non-active tokens will eventually be pruned
 *   active: true
 *
 *   // iso time, tokens expire
 *   timestamp: '2015-07-20T16:19:40.513Z'
 * }
 */
app.use( route.post( TOKEN_REQUEST_URL, function *() {
    let onForbidden = () => {
        log.warn( '403', this.request.ip, this.request.header[ 'user-agent' ], this.request.method, this.request.url )
        this.status = 403
    }

    // Quick check something is in the header
    if ( !this.request.headers[ 'x-level-connect' ] ) {
        onForbidden()
        return
    }

    // @TODO is this the best way to create the token? by ip/hostname or something?
    let newID = uuid.v4()

    try {
        yield clients.put( newID, {
            active: true,
            timestamp: Date.now()
        })
    } catch( err ) {
        log.error( this.request.ip, this.request.header[ 'user-agent' ], this.request.method, this.request.url, 'Error putting new token' )
        this.status = 500
        return
    }

    log.info( newID, this.request.method, this.request.url, 'OK', this.request.ip )
    log.debug( JSON.stringify( this.request ) )
    this.status = 201
    this.body = {
        id: newID
    }
}))

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
