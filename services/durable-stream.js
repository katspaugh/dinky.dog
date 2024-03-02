import DurableStreamClient from 'https://esm.sh/durable-stream-client'

const API_URL = 'durable_stream.katspaugh.workers.dev'
const DEV_API_URL = 'localhost:8787'

function getBrowserName() {
  const browsers = ['Chrome', 'Firefox', 'Safari', 'Brave', 'Opera', 'Edge']
  return browsers.find((browser) => navigator.userAgent.includes(browser)) || 'Unknown'
}

function randomEmoji() {
  const unicodeRanges = [
    // Animals
    [0x1f400, 0x1f43f],
    // Plants
    [0x1f330, 0x1f335],
  ]
  const emojiGroup = unicodeRanges[Math.floor(Math.random() * unicodeRanges.length)]
  const emoji = String.fromCodePoint(emojiGroup[0] + Math.floor(Math.random() * (emojiGroup[1] - emojiGroup[0])))
  return emoji
}

function randomId() {
  return Math.random().toString(36).slice(2, 9)
}

export function getClientId() {
  const clientId =
    localStorage.getItem('dinky_stream-clientId') || [getBrowserName(), randomEmoji(), randomId()].join('-')
  localStorage.setItem('dinky_stream-clientId', clientId)
  return clientId
}

// Initialize the client
export async function initDurableStream(subject) {
  const { host } = location
  const isDev = host.startsWith('localhost:')

  const client = new DurableStreamClient({
    host: isDev ? DEV_API_URL : API_URL,
    secure: !isDev,
    apiKey: btoa(host),
    subject,
  })

  await client.init()
  console.log('Durable Stream Client initialized', client)
  return client
}
