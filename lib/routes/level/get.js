
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
        let res = yield sub.get( this.params.key )
        this.onSuccess({
            status: 200,
            body: res
        })
    } catch( err ) {
        this.onFail({
            status: err.notFound ? 404 : 500,
            err: err
        })
    }
}
