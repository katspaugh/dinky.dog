import purify from 'https://unpkg.com/dompurify/dist/purify.es.mjs'

export function sanitizeHtml(html = '') {
  html = String(html).replace(/(#+)\s?(.+?)(?=\n|$)/gm, (_, hashes, text) => {
    const level = Math.min(4, hashes.length)
    return `<h${level}>${text}</h${level}>`
  })

  return purify.sanitize(html, {
    ALLOWED_TAGS: [
      'a',
      'b',
      'i',
      'em',
      'strong',
      'p',
      'br',
      'ul',
      'ol',
      'li',
      'h1',
      'h2',
      'h3',
      'h4',
      'h5',
      'h6',
      'blockquote',
      'code',
      'pre',
      'img',
      'table',
      'thead',
      'tbody',
      'tr',
      'th',
      'td',
      'div',
      'span',
    ],
    ALLOWED_ATTR: ['href', 'src', 'width', 'height', 'alt', 'title'],
  })
}
