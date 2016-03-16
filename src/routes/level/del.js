
import { getSublevel } from '../../db'

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
    await sub.del( ctx.params.key )
    ctx.onSuccess({
      status: 204
    })
  } catch( err ) {
    ctx.onFail({
      status: err.notFound ? 404 : 500,
      err: err
    })
  }
}
