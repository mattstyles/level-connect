
import JSONStream from 'JSONStream'

import log from '../../log'
import { getSublevel } from '../../db'

/**
 * Read route
 * Streams a full read of the sublevel
 */
export default function *( next ) {
    let sub = null

    // Grab the sub and return from route on error
    try {
        sub = getSublevel( this.params.sublevel )
    } catch( err ) {
        this.onFail({ err: err })
        return
    }

    // Grab a read stream to the sublevel
    try {
        this.type = 'json'
        let stream = sub.root.createReadStream({ encoding: 'json' })
            .on( 'data', data => {
                log.debug( 'READ', this.xClient, this.request.url, data.key + ':' + data.value )
            })
            .on( 'error', err => {
                log.error( 'READ', this.xClient, this.request.url, err )
            })
            .pipe( JSONStream.stringify( false ) )

        this.onSuccess({
            status: 200,
            body: stream
        })

    } catch( err ) {
        this.onFail({
            status: err.notFound ? 404 : 500,
            err: err
        })
    }
}
