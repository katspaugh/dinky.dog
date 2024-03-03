const allowedTags = ['b', 'i', 'u', 's', 'br', 'a']

function isLink(tag) {
  return !!tag.match(/^a href="[^"]+"$/)
}

export function sanitizeHtml(html = '') {
  return String(html)
    .replace(/<\/?([^>]+?)>/g, (str, tag) => {
      return allowedTags.includes(tag) || isLink(tag) ? str : '\n'
    })
    .trim()
}
