
import CONSTANTS from './constants'
import { clients} from './db'

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
      } catch (err) {
        throw new Error( 'ClientID error: ' + err.message )
      }

      if ( !res.active ) {
        throw new Error( 'Token inactive. Try requesting a new one.' )
      }

      // Check token should not be stale
      if ( Date.now() - res.timestamp > CONSTANTS.TOKEN_STALE ) {
        await clients.put( clientID, Object.assign( res, {
          active: false
        }))
        throw new Error( 'Token stale. Try requesting a new one.' )
      }

      // Freshen the timestamp
      await clients.put( clientID, Object.assign( res, {
        timestamp: Date.now()
      }))

      ctx.xClient = clientID
      await next
    } catch( err ) {
      ctx.onForbidden( err )
      return
    }
  }
}
