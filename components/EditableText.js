import { sanitizeHtml } from '../utils/parse-text.js'

export function EditableText({ onInput = null }) {
  const container = document.createElement('div')
  Object.assign(container.style, {
    padding: '10px',
    overflow: 'auto',
  })

  if (onInput) {
    container.contentEditable = 'true'

    container.oninput = () => {
      const html = sanitizeHtml(container.innerHTML)
      if (html !== container.innerHTML) {
        container.innerHTML = html
      }
      onInput(html)
    }

    container.onkeydown = (e) => {
      if ((e.key === 'Enter' && !e.shiftKey) || e.key === 'Escape') {
        e.preventDefault()
        container.blur()
      }
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

    destroy: () => container.remove(),
  }
}
