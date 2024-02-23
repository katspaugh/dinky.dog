const allowedTags = ['b', 'i', 'u', 'a', 'p', 'br']

export const sanitizeHtml = (html = '') => {
  return String(html).replace(/<\?([^>]+)>/g, (str, tag) => {
    return allowedTags.includes(tag) ? str : ''
  })
}
