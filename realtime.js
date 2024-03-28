import { initDurableStream } from './services/durable-stream.js'
import { debounce } from './utils/debounce.js'

const BROADCAST_DELAY = 300
const MESSAGE_MAX_AGE = 3 * 60e3 // 3 minutes

let _streamClient
let _clientId
let _isFirstBroadcast = true
let _peers = {}

function isFresh(timestamp) {
  return Date.now() - timestamp < MESSAGE_MAX_AGE
}

export async function init(clientId, streamId, lastSequence, onMessage) {
  _clientId = clientId

  try {
    _streamClient = await initDurableStream(streamId)
  } catch (err) {
    console.error('Failed to init stream client', err)
    return
  }

  _streamClient.subscribe(lastSequence, (msg, ack) => {
    ack()

    if (msg.data.clientId !== clientId && isFresh(msg.data.timestamp)) {
      console.log('Received message', msg)
      _peers[clientId] = msg.data.timestamp
      onMessage(msg)
    }
  })
}

export function broadcast(command, ...args) {
  const peerCount = Object.values(_peers).filter(isFresh).length

  if (_streamClient && (peerCount > 0 || _isFirstBroadcast)) {
    _isFirstBroadcast = false
    _streamClient.publish({ command, args, clientId: _clientId, timestamp: Date.now() })
  }
}

export const debouncedBroadcast = debounce(broadcast, BROADCAST_DELAY)
