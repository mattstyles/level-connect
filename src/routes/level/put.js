
import parse from 'co-body'

import { getSublevel } from '../../db'

/**
 * Put route
 * Handles atomic put and batch
 */
export default async ctx => {
  let body = await parse( ctx )
  let sub = null

  // Grab the sub and return from route on error
  try {
    sub = getSublevel( ctx.params.sublevel )
  } catch( err ) {
    ctx.onFail({ err: err })
    return
  }

  try {
    await sub.put( ctx.params.key, body )
    ctx.onSuccess({
      status: 201
    })
  } catch( err ) {
    ctx.onFail({ err: err })
    return
  }
}
