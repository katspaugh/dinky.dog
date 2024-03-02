/* @see https://github.com/gfodor/p2pcf */
import P2PCF from 'https://esm.sh/p2pcf'

const API_URL = 'https://p2pcf.katspaugh.workers.dev/'

function getBrowserName() {
  const browsers = ['Chrome', 'Firefox', 'Safari', 'Brave', 'Opera', 'Edge']
  return browsers.find((browser) => navigator.userAgent.includes(browser)) || 'Unknown'
}

function randomId() {
  return Math.random().toString(36).slice(2, 9)
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

export function initP2P(roomId) {
  const clientId = localStorage.getItem('dinky_clientId') || [getBrowserName(), randomEmoji(), randomId()].join('-')
  localStorage.setItem('dinky_clientId', clientId)

  const p2pcf = new P2PCF(clientId, roomId, {
    // Worker URL (optional) - if left out, will use a public worker
    workerUrl: API_URL,
    fastPollingRateMs: 1000,
    slowPollingRateMs: 2000,
  })

  // Start polling
  p2pcf.start()

  return p2pcf
}
