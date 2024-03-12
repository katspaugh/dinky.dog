const allowedTags = ['b', 'i', 'u', 's']

export function sanitizeHtml(html = '') {
  return String(html).replace(/<\/?([^>]+?)>/g, (str, tag) => {
    return allowedTags.includes(tag) ? str : '\n'
  })
}
