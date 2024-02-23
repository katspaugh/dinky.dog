import { sanitizeHtml } from '../utils/sanitize-html.js'

export function EditableText({ onInput = null }) {
  const container = document.createElement('div')
  Object.assign(container.style, {
    padding: '10px',
    overflow: 'auto',
    whiteSpace: 'pre-line',
  })

  if (onInput) {
    container.contentEditable = 'true'

    container.oninput = () => {
      onInput(sanitizeHtml(container.innerHTML))
    }
  }

  return {
    container,

    render: ({ text = '' }) => {
      const html = sanitizeHtml(text)
      if (html !== container.innerHTML) {
        container.innerHTML = html
      }
      return container
    },
  }
}
