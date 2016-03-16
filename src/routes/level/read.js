
import JSONStream from 'JSONStream'

import { getSublevel } from '../../db'

/**
 * Read route
 * Streams a full read of the sublevel
 */
export default async ctx => {
  let sub = null

  // Grab the sub and return from route on error
  try {
    sub = getSublevel( ctx.params.sublevel )
  } catch( err ) {
    ctx.onFail({ err: err })
    return
  }

  // Grab a read stream to the sublevel
  try {
    ctx.type = 'json'
    let stream = sub.createReadStream({ valueEncoding: 'json' })
      // .on( 'data', data => {
      //   ctx.logger.debug( 'READ', ctx.xClient, ctx.request.url, data.key + ':' + data.value )
      // })
      // .on( 'error', err => {
      //   ctx.logger.error( 'READ', ctx.xClient, ctx.request.url, err )
      // })
      .pipe( JSONStream.stringify( false ) )

    ctx.onSuccess({
      status: 200,
      body: stream
    })

  } catch( err ) {
    ctx.onFail({
      status: err.notFound ? 404 : 500,
      err: err
    })
  }
}
