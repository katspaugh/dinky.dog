// Detect if the string is a URL
export function parseUrl(text = '') {
  const match = text.match(/^(https?:\/\/\S+\.\S{2,})(?=&nbsp;|\s|<br>)*$/)
  return match ? match[1] || '' : ''
}

export function parseImageUrl(text = '') {
  const url = parseUrl(text)
  if (!url) return ''
  return /\.(jpe?g|png|gif|webp|svg)$/.test(url) ? url : ''
}

export function parseMath(text = '') {
  return /^[0-9+-/*^() ]+(?=&nbsp;|<br>)*$/.test(text) ? text : ''
}

export function parseEthAddress(text = '') {
  const match = text.match(/(?:^|\b)0x[a-f0-9]{40}(?=\b)/i)
  return match ? match[0] || '' : ''
}
