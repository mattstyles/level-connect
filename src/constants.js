
import path from 'path'
import os from 'os'

const CONSTANTS = {
  TOKEN_REQUEST_URL: '/new',
  TOKEN_STALE: 1000 * 60 * 60 * 24 * 3, // 3 days
  TOKEN_HEADER: 'x-level-connect',
  TOKEN_DELAY: 1000,

  DEFAULT_PATH: path.join( os.homedir(), '.level-connect.lev' ),
  DB_OPTS: {
    valueEncoding: 'json'
  },
  PING_URL: '/_ping',

  CONNECT_PATH: process.env.CONNECT_PATH,
  CONNECT_PORT: process.env.CONNECT_PORT,
  DEBUG: process.env.DEBUG
}

export default CONSTANTS
