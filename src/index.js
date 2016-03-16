
import Koa from 'koa'
import Logger from 'koa-bunyan-log'

import handlers from './middleware/handlers'
import handshake from './middleware/handshake'
import router from './routes/router'

// App stuff
const app = new Koa()
const logger = new Logger({
  name: 'level-connect'
})

logger.level( process.env.DEBUG ? 'debug' : 'info' )


app.use( logger.attach() )
app.use( logger.attachRequest() )


app.use( handlers() )
app.use( handshake() )


app.use( router() )


export default app
module.exports = app
