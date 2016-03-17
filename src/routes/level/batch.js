
import util from 'util'

import parse from 'co-body'

import { getSublevel } from '../../db'

/**
 * Handles batch requests to the db
 */
export default async ctx => {
  let ops = await parse( ctx )
  let sub = null

  // Quick check validity of batch ops
  try {
    if ( !util.isArray( ops ) ) {
      throw new Error( 'Batch operations should be an array of ops' )
    }

    ops.forEach( op => {
      if ( !op.type ) {
        throw new Error( 'Invalid batch operations' )
      }
    })
  } catch( err ) {
    ctx.onFail({
      status: 400,
      err: err
    })
    return
  }

  // Grab the sub and return from route on error
  try {
    sub = getSublevel( ctx.params.sublevel )
  } catch( err ) {
    ctx.onFail({ err: err })
    return
  }

  // Try to batch it up
  try {
    await sub.batch( ops )
    ctx, ctx.onSuccess({
      status: 201
    })
  } catch( err ) {
    ctx.onFail({
      status: err.notFound ? 404 : 500,
      err: err
    })
  }

  return
}
