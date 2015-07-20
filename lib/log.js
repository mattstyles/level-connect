
import bunyan from 'bunyan'
import CONSTANTS from './constants'

const log = bunyan.createLogger({
    name: 'level-connect'
})

log.level( CONSTANTS.DEBUG ? 'debug' : 'info' )

export default log
