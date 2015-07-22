
import Router from 'koa-router'

import CONSTANTS from '../constants'

export default function( opts ) {
    let router = Router()

    router.get( CONSTANTS.PING_URL, require( './util/ping' ) )

    router.post( CONSTANTS.TOKEN_REQUEST_URL, require( './clients/new' ) )

    router.post( '/:sublevel', require( './level/batch' ) )
    router.get( '/:sublevel', require( './level/read' ) )
    router.post( '/:sublevel/:key', require( './level/put' ) )
    router.get( '/:sublevel/:key', require( './level/get' ) )
    router.delete( '/:sublevel/:key', require( './level/del' ) )

    return router.routes()
}
