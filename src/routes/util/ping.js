
export default function *( next ) {
    this.onSuccess({
        status: 200,
        body: {
            ping: 'pong'
        }
    })
}
