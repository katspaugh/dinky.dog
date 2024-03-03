import { sanitizeHtml } from '../utils/sanitize-html.js'

export function EditableText({ onInput = null }) {
  const container = document.createElement('div')
  container.tabIndex = 0
  Object.assign(container.style, {
    padding: '10px',
    overflow: 'auto',
  })

  if (onInput) {
    container.contentEditable = 'true'

    container.oninput = () => {
      const value = container.innerHTML
      const html = sanitizeHtml(value)
      if (html !== value) {
        container.innerHTML = html
      }
      onInput(html)
    }

    container.onkeydown = (e) => {
      if (e.key === 'Escape') {
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
