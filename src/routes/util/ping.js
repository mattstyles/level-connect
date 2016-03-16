
export default async ctx => {
  ctx.onSuccess({
    status: 200,
    body: {
      ping: 'pong'
    }
  })
}
