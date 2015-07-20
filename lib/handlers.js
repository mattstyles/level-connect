
import log from './log'

/**
 * Handlers middleware
 * Creates independent handlers for each request
 */

export default function( opts ) {

    /**
     * Runs in koa context
     */
    return function *( next ) {
        this.onSuccess = function( opts ) {
            let status = opts.status || 200

            log.info( this.xClient, this.request.method, this.request.url, 'OK', this.request.ip )
            log.debug( JSON.stringify( this.request ) )

            return {
                status: status,
                body: opts.body || {
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

        this.onForbidden = function( err ) {
            log.warn( '403', this.request.ip, this.request.header[ 'user-agent' ], this.request.method, this.request.url )
            this.status = 403

            if ( err ) {
                log.error( err )
                this.body = {
                    body: err.message
                }
            }
        }

        yield next
    }
}
