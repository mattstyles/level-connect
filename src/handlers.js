
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
        /**
         * @param opts <Object>
         *   status <?Integer> http code
         *   body <?String> custom fail message
         */
        this.onSuccess = function( opts ) {
            let status = opts.status || 200

            log.info({
                event: 'onSuccess',
                clientID: this.xClient || 'new',
                method: this.request.method,
                url: this.request.url,
                status: status,
                ip: this.request.ip,
                ua: this.request.header[ 'user-agent' ],
                body: opts.body || 'OK'
            })
            log.debug( JSON.stringify( this.request ) )

            this.status = status
            this.body = opts.body || {
                body: 'OK'
            }
        }

        /**
         * @param opts <Object>
         *   status <?Integer> http code
         *   body <?String> custom fail message
         *   err <?Error> Error triggering the fail
         */
        this.onFail = function( opts ) {
            let status = opts.status || 500
            let msg = opts.err ? opts.err.message : opts.body || 'Unspecified Error'

            log.error({
                event: 'onFail',
                clientID: this.xClient || 'new',
                method: this.request.method,
                url: this.request.url,
                status: status,
                ip: this.request.ip,
                ua: this.request.header[ 'user-agent' ],
                body: msg || 'OK'
            })
            log.debug( JSON.stringify( this.request ) )

            if ( opts.err ) {
                log.debug( opts.err )
            }

            this.status = status
            this.body = {
                body: msg
            }
        }

        /**
         * @param err <Error>
         */
        this.onForbidden = function( err ) {
            log.warn({
                event: 'onForbidden',
                clientID: this.xClient || 'new',
                method: this.request.method,
                url: this.request.url,
                status: 403,
                ip: this.request.ip,
                ua: this.request.header[ 'user-agent' ]
            })
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
