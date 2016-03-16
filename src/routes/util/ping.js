
export default async ctx => {
  console.log( 'hitting ping' )
  ctx.onSuccess({
    status: 200,
    body: {
      ping: 'pong'
    }
  })
}
