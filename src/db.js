
import party from 'level-party'
import sublevel from 'level-sublevel'
import promisify from 'level-promisify'

import CONSTANTS from './constants'

const dbpath = CONSTANTS.CONNECT_PATH || CONSTANTS.DEFAULT_PATH
const level = party( dbpath, CONSTANTS.DB_OPTS )
const root = sublevel( level )

export default root

export const clients = promisify( root.sublevel( '_client' ), CONSTANTS.DB_OPTS )

export function getSublevel( sublevel ) {
    return promisify( root.sublevel( sublevel, CONSTANTS.DB_OPTS ) )
}
