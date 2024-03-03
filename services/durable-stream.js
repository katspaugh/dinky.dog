import DurableStreamClient from 'https://esm.sh/durable-stream-client'
import * as storage from './local-storage.js'

const PROD_HOST = 'dinky.dog'
const API_URL = 'durable_stream.katspaugh.workers.dev'
const DEV_API_URL = 'localhost:8787'
const CLIENT_ID_KEY = 'stream-clientId'

function getBrowserName() {
  const browsers = ['Chrome', 'Firefox', 'Safari', 'Brave', 'Opera', 'Edge']
  const oses = ['Windows', 'Mac OS', 'iOS', 'Android', 'Linux']
  const browser = browsers.find((browser) => navigator.userAgent.includes(browser)) || 'Unknown browser'
  const os = oses.find((os) => navigator.userAgent.includes(os)) || 'Unknown OS'
  return `${browser}/${os}`
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
  return Math.random().toString(36).slice(2)
}

export function getClientId() {
  const clientId = storage.getItem(CLIENT_ID_KEY) || [getBrowserName(), randomEmoji(), randomId()].join('-')
  storage.setItem(CLIENT_ID_KEY, clientId)
  return clientId
}

// Initialize the client
export async function initDurableStream(subject) {
  const { host } = location
  const isDev = host !== PROD_HOST

  const client = new DurableStreamClient({
    host: isDev ? DEV_API_URL : API_URL,
    secure: !isDev,
    apiKey: btoa(host),
    subject,
  })

  await client.init()
  console.log('Durable Stream initialized', client)
  return client
}
