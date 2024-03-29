import purify from 'https://unpkg.com/dompurify/dist/purify.es.mjs'
import snarkdown from 'https://cdn.jsdelivr.net/npm/snarkdown/dist/snarkdown.es.js'

const URLS_REGEXP = /([^>"]|^)(https?:\/\/[a-z0-9-_.]+\.\S{2,}(\/.+)?)(?=[^<"]|$)\b/gi

function markdown(html = '') {
  html = html.replace(URLS_REGEXP, (_, before, url) => {
    return `${before}<a href="${url}" target="_blank">${url}</a>`
  })
  return snarkdown(html)
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
