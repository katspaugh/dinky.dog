const allowedTags = ['b', 'i', 'u', 'a', 'p', 'br']

export const sanitizeHtml = (html = '') => {
  return String(html).replace(/<\?([^>]+)>/g, (str, tag) => {
    return allowedTags.includes(tag) ? str : ''
  })
}

export const parseUrl = (text) => {
  const match = text.match(/^(https?:\/\/\S+\.\S{2,})$/)
  return match ? match[1] || '' : ''
}
