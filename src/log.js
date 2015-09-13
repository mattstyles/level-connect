
import Logger from 'koa-bunyan-log'
import CONSTANTS from './constants'

const logger = new Logger({
    name: 'level-connect'
})

logger.level( CONSTANTS.DEBUG ? 'debug' : 'info' )

export default logger
