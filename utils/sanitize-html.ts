import purify from 'https://unpkg.com/dompurify/dist/purify.es.mjs'

function markdown(html) {
  return html
    .replace(/(#+)\s*(.*)(\n|$)/g, (_, hashes, text) => {
      const level = Math.min(5, hashes.length)
      return `<h${level}>${text}</h${level}>`
    })
    .replace(/\*\*(.*)\*\*/g, '<b>$1</b>')
    .replace(/_(.*)_/g, '<i>$1</i>')
    .replace(/^- (.*)(\n|$)/gm, '<li>$1</li>')
}

export function sanitizeHtml(html = '') {
  return purify.sanitize(markdown(html), {
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
