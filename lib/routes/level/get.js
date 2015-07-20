
import { getSublevel } from '../../db'

export default function *( next ) {
    try {
        let sub = getSublevel( this.params.sublevel )
        console.log( this.params )
        let res = yield sub.get( this.params.key )
        Object.assign( this, this.onSuccess( res ) )
    } catch( err ) {
        Object.assign( this, this.onFail( err ) )
    }
}
