
import Koa from 'koa'
import Logger from 'koa-bunyan-log'

// App stuff
const app = new Koa()
const logger = new Logger({
  name: 'level-connect'
})

logger.level( process.env.DEBUG ? 'debug' : 'info' )

import handlers from './handlers'
import handshake from './handshake'
// import router from './routes/router'

// Attach logger
app.use( logger.attach() )
app.use( logger.attachRequest() )

// Attach output handlers
app.use( handlers() )

// Client handshake
app.use( handshake() )

// Define routes
// app.use( router() )


export default app
module.exports = app
