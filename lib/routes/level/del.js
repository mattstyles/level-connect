
import { getSublevel } from '../../db'

export default function *( next ) {
    try {
        let sub = getSublevel( this.params.sublevel )
        yield sub.del( this.params.key )
        Object.assign( this, this.onSuccess({
            status: 204
        }))
    } catch( err ) {
        Object.assign( this, this.onFail({ err: err }) )
    }
}
