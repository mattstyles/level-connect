
import Router from 'koa-router'

import CONSTANTS from '../constants'

import ping from './util/ping'
import token from './clients/new'
import get from './level/get'
import put from './level/put'
import del from './level/del'
import read from './level/read'

/**
 * Creates the router and returns a middleware function
 */
export default function( opts ) {
  let router = new Router()

  router.get( CONSTANTS.PING_URL, ping )

  router.post( CONSTANTS.TOKEN_REQUEST_URL, token )

  // router.post( '/:sublevel', require( './level/batch' ) )
  router.get( '/:sublevel', read )
  router.post( '/:sublevel/:key', put )
  router.get( '/:sublevel/:key', get )
  router.delete( '/:sublevel/:key', del )

  return router.routes()
}
