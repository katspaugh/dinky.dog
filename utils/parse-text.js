const allowedTags = [
  'b',
  'i',
  'u',
  's',
  'p',
  'br',
  'h1',
  'h2',
  'h3',
  'h4',
  'h5',
  'h6',
  'em',
  'strong',
  'ul',
  'ol',
  'li',
  'blockquote',
  'code',
  'pre',
  'hr',
]

const isLink = (tag) => {
  return !!tag.match(/^a href="[^"]+"$/)
}

export const sanitizeHtml = (html = '') => {
  return String(html).replace(/<\?([^>]+)>/g, (str, tag) => {
    return allowedTags.includes(tag) || isLink(tag) ? str : ''
  })
}

export const parseUrl = (text) => {
  const match = text.match(/^(https?:\/\/\S+\.\S{2,})$/)
  return match ? match[1] || '' : ''
}
