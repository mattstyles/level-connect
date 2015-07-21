
import Router from 'koa-router'

import CONSTANTS from '../constants'

export default function( opts ) {
    let router = Router()

    router.post( CONSTANTS.TOKEN_REQUEST_URL, require( './clients/new' ) )

    router.post( '/:sublevel', require( './level/batch' ) )
    router.post( '/:sublevel/:key', require( './level/put' ) )
    router.get( '/:sublevel/:key', require( './level/get' ) )
    router.delete( '/:sublevel/:key', require( './level/del' ) )

    return router.routes()
}
