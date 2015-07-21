
import util from 'util'

import parse from 'co-body'

import { getSublevel } from '../../db'

/**
 * Handles batch requests to the db
 */
export default function *( next ) {
    let ops = yield parse( this )
    let sub = null

    // Quick check validity of batch ops
    try {
        if ( !util.isArray( ops ) ) {
            throw new Error( 'Batch operations should be an array of ops' )
        }

        ops.forEach( op => {
            if ( !op.type ) {
                throw new Error( 'Invalid batch operations' )
            }
        })
    } catch( err ) {
        this.onFail({
            status: 400,
            err: err
        })
        return
    }

    // Grab the sub and return from route on error
    try {
        sub = getSublevel( this.params.sublevel )
    } catch( err ) {
        this.onFail({ err: err })
        return
    }

    // Try to batch it up
    try {
        yield sub.batch( ops )
        Object.assign( this, this.onSuccess({
            status: 201
        }))
    } catch( err ) {
        this.onFail({
            status: err.notFound ? 404 : 500,
            err: err
        })
    }

    return
}
