
import uuid from 'node-uuid'

import CONSTANTS from '../../constants'
import log from '../../log'
import { clients } from '../../db'

export default function *( next ) {
    // Quick check something is in the header
    if ( !this.request.headers[ CONSTANTS.TOKEN_HEADER ] ) {
        this.onForbidden()
        return
    }

    // @TODO is this the best way to create the token? by ip/hostname or something?
    let newID = uuid.v4()

    try {
        yield clients.put( newID, {
            active: true,
            timestamp: Date.now()
        })
    } catch( err ) {
        log.error( this.request.ip, this.request.header[ 'user-agent' ], this.request.method, this.request.url, 'Error putting new token' )
        this.status = 500
        return
    }

    log.info( newID, this.request.method, this.request.url, 'OK', this.request.ip )
    log.debug( JSON.stringify( this.request ) )

    this.status = 201
    this.body = {
        id: newID
    }
}
