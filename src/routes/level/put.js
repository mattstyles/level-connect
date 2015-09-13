
import parse from 'co-body'

import { getSublevel } from '../../db'

/**
 * Put route
 * Handles atomic put and batch
 */
export default function *( next ) {
    let body = yield parse( this )
    let sub = null

    // Grab the sub and return from route on error
    try {
        sub = getSublevel( this.params.sublevel )
    } catch( err ) {
        this.onFail({ err: err })
        return
    }

    try {
        yield sub.put( this.params.key, body )
        this.onSuccess({
            status: 201
        })
    } catch( err ) {
        this.onFail({ err: err })
        return
    }
}
