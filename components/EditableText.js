import { sanitizeHtml } from '../utils/sanitize-html.js'

export function EditableText({ onInput = null } = {}) {
  const container = document.createElement('div')
  container.tabIndex = 0
  Object.assign(container.style, {
    padding: '8px',
    overflow: 'auto',
    overflowWrap: 'normal',
    maxWidth: '100%',
    height: '100%',
    whiteSpace: 'pre-wrap',
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
      } else if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault()
        container.blur()
      }
    }

    container.onblur = () => {
      container.scrollLeft = 0
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
