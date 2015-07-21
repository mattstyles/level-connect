
import { getSublevel } from '../../db'

export default function *( next ) {
    try {
        let sub = getSublevel( this.params.sublevel )
        let res = yield sub.get( this.params.key )
        this.onSuccess({
            status: 200,
            body: res
        })
    } catch( err ) {
        this.onFail({ err: err })
    }
}
