
export async function wait( ms ) {
  return {
    then: cb => setTimeout( cb, ms )
  }
}
