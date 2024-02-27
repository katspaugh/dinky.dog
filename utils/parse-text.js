const allowedTags = ['b', 'i', 'u', 's', 'p', 'br']

const isLink = (tag) => {
  return !!tag.match(/^a href="[^"]+"$/)
}

export const sanitizeHtml = (html = '') => {
  return String(html)
    .replace(/<\/?([^>]+?)>/g, (str, tag) => {
      return allowedTags.includes(tag) || isLink(tag) ? str : '\n'
    })
    .trim()
}

export const parseUrl = (text) => {
  const match = text.match(/^(https?:\/\/\S+\.\S{2,})$/)
  return match ? match[1] || '' : ''
}
