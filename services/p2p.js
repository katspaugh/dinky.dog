/* @see https://github.com/gfodor/p2pcf */
import P2PCF from 'https://esm.sh/p2pcf'

export function initP2P(clientId, roomId) {
  const p2pcf = new P2PCF(clientId, roomId, {
    // Worker URL (optional) - if left out, will use a public worker
    // workerUrl: '<your worker url>',
  })

  // Start polling
  p2pcf.start()

  return p2pcf
}
