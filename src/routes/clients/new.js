
import uuid from 'node-uuid'

import CONSTANTS from '../../constants'
import { clients } from '../../db'
import { wait } from '../../util/timing'


export default async ctx => {
  // Quick check something is in the header
  if ( !ctx.request.headers[ CONSTANTS.TOKEN_HEADER ] ) {
    ctx.onForbidden()
    return
  }

  // @TODO best way to create token?
  let newID = uuid.v4()

  try {
    await clients.put( newID, {
      active: true,
      timestamp: Date.now()
    })
  } catch( err ) {
    ctx.onFail( err )
    return
  }

  // Time-limit token generation
  await wait( CONSTANTS.TOKEN_DELAY )

  ctx.onSuccess({
    status: 201,
    body: {
      id: newID
    }
  })
}
