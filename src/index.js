
import koa from 'koa'
import logger from './log'

// App stuff
const app = koa()

import handlers from './handlers'
import handshake from './handshake'
import router from './routes/router'

// Attach logger
app.use( logger.attach() )
app.use( logger.attachRequest() )

// Attach output handlers
app.use( handlers() )

// Client handshake
app.use( handshake() )

// Define routes
app.use( router() )


export default app
