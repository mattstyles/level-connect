
import levelws from 'level-ws'
import through2 from 'through2'

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

  try {
    ctx.type = 'json'
    let stream = levelws( sub ).createWriteStream({
      valueEncoding: 'json'
    })

    let os = through2.obj( ( chunk, enc, done ) => {
      let data = null
      try {
        data = JSON.parse( chunk.toString() )
      } catch ( err ) {
        throw new Error( err )
      }

      console.log( data )

      done( null, data )
    })

    // Accept consistent data and pipe to level
    ctx.req
      .pipe( os )
      .pipe( stream )


    ctx.onSuccess({
      status: 200,
      body: ctx.req
    })

  } catch ( err ) {
    ctx.onFail({
      status: err.notFound ? 404 : 500,
      err: err
    })
  }
}
