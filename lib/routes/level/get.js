
import { getSublevel } from '../../db'

export default function *( next ) {
    try {
        let sub = getSublevel( this.params.sublevel )
        let res = yield sub.get( this.params.key )
        Object.assign( this, this.onSuccess({
            status: 200,
            body: res
        }))
    } catch( err ) {
        Object.assign( this, this.onFail( err ) )
    }
}
