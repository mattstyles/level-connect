
import os from 'os'
import path from 'path'

import koa from 'koa'
import route from 'koa-route'
import parse from 'co-body'

import uuid from 'node-uuid'

import promisify from 'level-promisify'

// App stuff
const app = koa()

const TOKEN_REQUEST_URL = '/new'

import handlers from './lib/handlers'
import handshake from './lib/handshake'
import { clients } from './lib/db'
import root from './lib/db'
import log from './lib/log'


// Output handlers
app.use( handlers() )

// Client handshake
app.use( handshake() )

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
    if ( !this.request.headers[ CONSTANTS.TOKEN_HEADER ] ) {
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
