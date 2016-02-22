
/**
 * Handlers middleware
 * Creates independent handlers for each request
 */

export default function( opts ) {

  /**
   * Runs in koa context
   */
  return async ( ctx, next ) => {
    /**
     * @param opts <Object>
     *   status <?Integer> http code
     *   body <?String> custom fail message
     */
    ctx.onSuccess = function( opts ) {
      let status = opts.status || 200

      ctx.logger.info({
        event: 'onSuccess',
        clientID: ctx.xClient || 'new',
        method: ctx.request.method,
        url: ctx.request.url,
        status: status,
        ip: ctx.request.ip,
        ua: ctx.request.header[ 'user-agent' ],
        body: opts.body || 'OK'
      })
      ctx.logger.debug( JSON.stringify( ctx.request ) )

      ctx.status = status
      ctx.body = opts.body || {
        body: 'OK'
      }
    }

    /**
     * @param opts <Object>
     *   status <?Integer> http code
     *   body <?String> custom fail message
     *   err <?Error> Error triggering the fail
     */
    ctx.onFail = function( opts ) {
      let status = opts.status || 500
      let msg = opts.err ? opts.err.message : opts.body || 'Unspecified Error'

      ctx.logger.error({
        event: 'onFail',
        clientID: ctx.xClient || 'new',
        method: ctx.request.method,
        url: ctx.request.url,
        status: status,
        ip: ctx.request.ip,
        ua: ctx.request.header[ 'user-agent' ],
        body: msg || 'OK'
      })
      ctx.logger.debug( JSON.stringify( ctx.request ) )

      if ( opts.err ) {
        ctx.logger.debug( opts.err )
      }

      ctx.status = status
      ctx.body = {
        body: msg
      }
    }

    /**
     * @param err <Error>
     */
    ctx.onForbidden = function( err ) {
      ctx.logger.warn({
        event: 'onForbidden',
        clientID: ctx.xClient || 'new',
        method: ctx.request.method,
        url: ctx.request.url,
        status: 403,
        ip: ctx.request.ip,
        ua: ctx.request.header[ 'user-agent' ]
      })
      ctx.status = 403

      if ( err ) {
        ctx.logger.error( err )
        ctx.body = {
          body: err.message
        }
      }
    }

    await next()
  }
}
