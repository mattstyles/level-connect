
import CONSTANTS from '../../constants'
import log from '../../log'

export default function *( next ) {
    log.info( this.request.method, this.request.url, 'OK', this.request.ip )

    this.onSuccess({
        status: 200,
        body: {
            ping: 'pong'
        }
    })
}
