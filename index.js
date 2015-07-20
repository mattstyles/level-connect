
import koa from 'koa'

// App stuff
const app = koa()

import handlers from './lib/handlers'
import handshake from './lib/handshake'
import router from './lib/routes/router'


// Attach output handlers
app.use( handlers() )

// Client handshake
app.use( handshake() )

// Define routes
app.use( router() )


export default app
