export function randomId(length = 16) {
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
