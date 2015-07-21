
import { getSublevel } from '../../db'

export default function *( next ) {
    try {
        let sub = getSublevel( this.params.sublevel )
        yield sub.del( this.params.key )
        this.onSuccess({
            status: 204
        })
    } catch( err ) {
        this.onFail({ err: err })
    }
}
