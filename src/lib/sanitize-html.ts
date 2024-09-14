// @ts-ignore
import purify from 'https://unpkg.com/dompurify/dist/purify.es.mjs'

function markdown(html: string) {
  return html
    .replace(/(#+)\s*(.*?)(\n|<br|$)/mg, (_, hashes, text, end) => {
      const level = Math.min(5, hashes.length)
      return `<h${level}>${text}</h${level}>${end}`
    })
    .replace(/\*\*(.*)\*\*/g, '<b>$1</b>')
    .replace(/~(.*)~/g, '<s>$1</s>')
    .replace(/\b_(.*)_\b/g, '<i>$1</i>')
    .replace(/```(.+?)?\n?(.+?)\n?```/g, '<pre><code title="$1">$2</code></pre>')
    .replace(/`(.*)`/g, '<code>$1</code>')
    .replace(/^- (.*)(\n|$)/gm, '<li>$1</li>')
    .replace(/ -- /g, ' — ')
    .replace(/\n/g, '<br>')
}

export function sanitizeHtml(html = '') {
  return purify.sanitize(markdown(html), {
    ALLOWED_TAGS: [
      'a',
      'b',
      'i',
      's',
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
      'audio',
    ],
    ALLOWED_ATTR: ['href', 'src', 'width', 'height', 'alt', 'title', 'crossorigin', 'controls', 'target'],
  })
}
