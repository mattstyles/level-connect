
import util from 'util'

import parse from 'co-body'

import { getSublevel } from '../../db'

/**
 * Put route
 * Handles atomic put and batch
 */
export default function *( next ) {
    // Must contain sublevel and key
    if ( !this.params.sublevel && !this.params.key ) {
        this.onFail({
            status: 400,
            body: 'Request should contain sublevel and/or key'
        })
    }

    let body = yield parse( this )
    let sub = null

    // Grab the sub and return from route on error
    try {
        sub = getSublevel( this.params.sublevel )
    } catch( err ) {
        this.onFail({ err: err })
        return
    }


    // If there is no key and sublevel is an array then assume a batch request
    if ( util.isArray( this.params.sublevel ) && !this.params.key ) {
        try {
            // Quick check validity of batch ops
            this.params.sublevel.forEach( op => {
                if ( !op.type ) {
                    throw new Error({
                        status: 400,
                        body: 'Invalid batch operations'
                    })
                }
            })
        } catch( err ) {
            this.onFail( err )
            return
        }

        try {
            yield sub.batch( this.params.sublevel )
            Object.assign( this, this.onSuccess({
                status: 201
            }))
        } catch( err ) {
            this.onFail({ err: err })
        }

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
