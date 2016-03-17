

export default function chunker() {
  // Store chunk parts to counter when a chunk splits
  var body = []

  // This stream sometimes gets data split across a chunk, roughly .05%
  return function combiner( chunk, done ) {
    let data = null

    // Push the partial onto the body
    body.push( chunk.toString() )

    try {
      data = JSON.parse( body.join( '' ) )
    } catch ( err ) {
      // Error means a parse error caused by a line split
      // Partial line is already stored in body so pass through
      // the next hit should complete it and get JSON.parse working
      done()
      return
    }

    // Reset body as this request is dealt with
    body = []
    done( null, data )
  }
}
