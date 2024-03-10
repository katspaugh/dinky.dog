// Detect if the string is a URL
export function parseUrl(text = '') {
  const match = text.match(/\b(https?:\/\/[a-z0-9-_.]+\.\S{2,}(\/.+)?)\b/i)
  return match ? match[1] || '' : ''
}

export function parseImageUrl(text = '') {
  const url = parseUrl(text)
  if (!url) return ''
  return /\.(jpe?g|png|gif|webp|svg)($|\?)/.test(url) ? url : ''
}

export function parseAudioUrl(text = '') {
  const url = parseUrl(text)
  if (!url) return ''
  return /\.(mp3|wav|ogg|flac|aac|wma|alac|aiff|webm)($|\?)/.test(url) ? url : ''
}

export function parseMath(text = '') {
  const match = text.match(/^([-0-9+-/*^() ]+)=(?=&nbsp;|<br>)*$/)
  return match ? match[1] : ''
}

export function parseEthAddress(text = '') {
  const match = text.match(/(?:^|\b)0x[a-f0-9]{40}(?=\b)/i)
  return match ? match[0] || '' : ''
}
