
import party from 'level-party'
import sublevel from 'level-sublevel'
import then from 'then-levelup'

import CONSTANTS from './constants'

/**
 * Wrap root instance
 */
const dbpath = CONSTANTS.CONNECT_PATH || CONSTANTS.DEFAULT_PATH
const level = party( dbpath, CONSTANTS.DB_OPTS )
const root = sublevel( level )

export default root


/**
 * Expose connected clients db
 */
export const clients = then( root.sublevel( '_client', CONSTANTS.DB_OPTS ) )


/**
 * Create a reference to sublevels
 */
let sublevels = new Map()

export function getSublevel( sublevel ) {
  if ( sublevels.has( sublevel ) ) {
    return sublevels.get( sublevel )
  }

  let newSublevel = then( root.sublevel( sublevel, CONSTANTS.DB_OPTS ) )
  sublevels.set( sublevel, newSublevel )
  return newSublevel
}
