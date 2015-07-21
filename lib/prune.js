
import CONSTANTS from './constants'
import { clients } from './db'

var pruning = []


function prune() {
    if ( !pruning.length ) {
        console.log( 'No tokens to prune' )
        return
    }

    clients.batch( pruning.map( key => {
        console.log( 'Pruning:', key )
        return {
            type: 'del',
            key: key
        }
    }))
        .then( res => {
            console.log( '\nPrune complete' )
        })
        .catch( err => {
            console.error( 'Pruning error' )
            console.error( err )
        })
}

// Prunes active and stale tokens
clients.root.createReadStream()
    .on( 'data', data => {
        if ( !data.value.active ) {
            pruning.push( data.key )
            return
        }

        if ( Date.now() - data.value.timestamp > CONSTANTS.TOKEN_STALE ) {
            pruning.push( data.key )
            return
        }
    })
    .on( 'error', err => {
        console.error( 'Error streaming client tokens' )
        console.error( err )
    })
    .on( 'end', prune )
