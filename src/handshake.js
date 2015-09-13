
import CONSTANTS from './constants'
import { clients } from './db'

/**
 * Client handshake middleware
 */
export default function( opts ) {

    /**
     * Runs in koa context
     */
    return function *( next ) {
        // Let through the token request route
        if ( this.request.url === CONSTANTS.TOKEN_REQUEST_URL ) {
            yield next
            return
        }

        if ( !this.request.headers[ CONSTANTS.TOKEN_HEADER ] ) {
            this.onForbidden()
            return
        }

        // Check the client is registered
        let clientID = this.request.headers[ CONSTANTS.TOKEN_HEADER ]
        try {
            // Grab the token and make sure it is still fresh
            let res = null
            try {
                res = yield clients.get( clientID )
            } catch( err ) {
                throw new Error( 'ClientID error: ' + err.message )
            }

            if ( !res.active ) {
                throw new Error( 'Token inactive. Try requesting a new one.' )
            }

            // Check token should not be stale
            if ( Date.now() - res.timestamp > CONSTANTS.TOKEN_STALE ) {
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
            this.onForbidden( err )
            return
        }
    }
}
