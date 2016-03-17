
import levelws from 'level-ws'
import es from 'event-stream'

import { getSublevel } from '../../db'
import chunkCombiner from '../../util/chunkCombiner'



/**
 * Write route
 * Streams a write into the sublevel
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

  try {
    ctx.type = 'json'
    let ws = levelws( sub ).createWriteStream({
      valueEncoding: ctx.type
    })

    // Sanitize and pass to level write stream
    ctx.req
      .pipe( es.map( chunkCombiner() ) )
      .pipe( ws )

    ctx.onSuccess({
      // status: 200,
      body: ctx.req
    })

  } catch ( err ) {
    ctx.onFail({
      status: err.notFound ? 404 : 500,
      err: err
    })
  }
}
