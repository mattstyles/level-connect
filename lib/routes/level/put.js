
import parse from 'co-body'

import { getSublevel } from '../../db'

export default function *( next ) {
    let body = yield parse( this )

    try {
        let sub = getSublevel( this.params.sublevel )
        yield sub.put( this.params.key, body )
        Object.assign( this, this.onSuccess({
            status: 201
        }))
    } catch( err ) {
        Object.assign( this, this.onFail( err ) )
    }
}
