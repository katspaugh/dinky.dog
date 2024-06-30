export function debounce(fn: (...args: any[]) => void, ms: number) {
  let timer: number
  return function(...args: any[]) {
    clearTimeout(timer)
    timer = setTimeout(() => fn(...args), ms)
  }
}

export function randomId(length = 8) {
  let array = new Uint8Array(length)
  window.crypto.getRandomValues(array)

  let randomId = ''
  for (let i = 0; i < array.length; i++) {
    randomId += array[i].toString(16).padStart(2, '0')
  }

  return randomId
}

export function randomEmoji() {
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

export function parseUrl(text = '') {
  const match = text.match(/^(https?:\/\/[-a-z0-9._]+?\.[a-z]{2,}(\/[-a-z0-9._?=&%]+)*)(?=\s|<|$)/i)
  return match ? match[1] || '' : ''
}

export function parseImageUrl(url: string) {
  return /\.(jpe?g|png|gif|webp|svg)($|\?)/.test(url) ? url : ''
}

export function parseAudioUrl(url: string) {
  return /\.(mp3|wav|ogg|flac|aac|wma|alac|aiff|webm)($|\?)/.test(url) ? url : ''
}
