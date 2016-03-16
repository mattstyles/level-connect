
import CONSTANTS from './constants'
import { clients } from './db'

/**
 * Client handshake middleware
 */
export default function( opts ) {

  /**
   * Runs in koa context
   */
  return async ( ctx, next ) => {
    // Let through the token request route
    if ( ctx.request.url === CONSTANTS.TOKEN_REQUEST_URL ) {
      await next()
      return
    }

    if ( !ctx.request.headers[ CONSTANTS.TOKEN_HEADER ] ) {
      ctx.onForbidden()
      return
    }

    // Check the client is registered
    let clientID = ctx.request.headers[ CONSTANTS.TOKEN_HEADER ]
    try {
      // Grab the token and make sure it is still fresh
      let res = null
      try {
        res = await clients.get( clientID )
      } catch( err ) {
        if ( err.notFound || err.status === 404 ) {
          ctx.onForbidden( 'Token invalid. Try requesting a new one.' )
          return
        }

        throw new Error( 'ClientID error: ' + err.message )
      }

      // Check ip is stable
      if ( res.ip !== ctx.request.ip ) {
        await clients.del( clientID )
        ctx.onForbidden( 'Token authentication failed. Try requesting a new one.' )
        return
      }

      // Check token should not be stale
      if ( Date.now() - res.timestamp > CONSTANTS.TOKEN_STALE ) {
        await clients.del( clientID )
        ctx.onForbidden( 'Token stale. Try requesting a new one.' )
        return
      }

      // Freshen the timestamp
      // @TODO why wait here?
      await clients.put( clientID, Object.assign( res, {
        timestamp: Date.now(),
        ip: ctx.request.ip
      }))

      ctx.xClient = clientID
      await next
    } catch( err ) {
      ctx.onForbidden( err )
      return
    }
  }
}
