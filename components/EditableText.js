import { sanitizeHtml } from '../utils/parse-text.js'

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
      onInput(container.innerHTML)
    }

    container.onblur = () => {
      const html = sanitizeHtml(container.innerHTML)
      if (html !== container.innerHTML) {
        container.innerHTML = html
        onInput(html)
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
