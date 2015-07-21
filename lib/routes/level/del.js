
import { getSublevel } from '../../db'

export default function *( next ) {
    let sub = null

    // Grab the sub and return from route on error
    try {
        sub = getSublevel( this.params.sublevel )
    } catch( err ) {
        this.onFail({ err: err })
        return
    }

    try {
        yield sub.del( this.params.key )
        this.onSuccess({
            status: 204
        })
    } catch( err ) {
        this.onFail({ err: err })
    }
}
