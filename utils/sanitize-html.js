const allowedTags = ['b', 'i', 'u', 's']

export function sanitizeHtml(html = '') {
  return String(html)
    .replace(/<br\s*\/?>/g, '\n')
    .replace(/<\/?(.+?)>/g, (str, tag) => {
      return allowedTags.includes(tag) ? str : ''
    })
    .replace(/^\s+/, '')
}
