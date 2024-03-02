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
    [0x1f331, 0x1f333], // Plant
    [0x1f334, 0x1f335], // Plant
    [0x1f340, 0x1f341], // Plant
    [0x1f34f, 0x1f37f], // Food
    [0x1f950, 0x1f96b], // Food
    [0x1f400, 0x1f43e], // Animal
    [0x1f981, 0x1f984], // Animal
    [0x1f3b0, 0x1f3bd], // Sports
    [0x1f3bc, 0x1f3b7], // Music
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
  })

  // Start polling
  p2pcf.start()

  return p2pcf
}
