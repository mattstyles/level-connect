
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
        // body: opts.body || 'OK'
        body: 'OK'
      })

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

      if ( opts.err && opts.status !== 404 ) {
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
        ua: ctx.request.header[ 'user-agent' ],
        body: typeof err === 'string' ? err : null
      })

      if ( err instanceof Error ) {
        ctx.logger.error( err )
        ctx.status = 500
        ctx.body = {
          body: 'Server error'
        }

        return
      }

      ctx.status = 403
      ctx.body = {
        body: err
      }
    }

    await next()
  }
}
