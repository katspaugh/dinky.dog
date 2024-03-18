import { Component } from '../utils/dom.js'
import { sanitizeHtml } from '../utils/sanitize-html.js'

export function EditableText({ onInput }) {
  const component = Component({
    style: {
      padding: '8px',
      overflow: 'auto',
      overflowWrap: 'normal',
      maxWidth: '100%',
      height: '100%',
      whiteSpace: 'pre-wrap',
    },

    props: {
      tabIndex: 0,

      contentEditable: onInput ? 'true' : 'false',

      oninput: () => {
        const { container } = component
        const value = container.innerHTML
        const html = sanitizeHtml(value)
        if (html !== value) {
          container.innerHTML = html
        }
        onInput && onInput(html)
      },

      onkeydown: (e) => {
        const { container } = component
        if (e.key === 'Escape') {
          container.blur()
        } else if (e.key === 'Enter' && !e.shiftKey) {
          e.preventDefault()
          container.blur()
        }
      },

      onblur: () => {
        const { container } = component
        container.scrollLeft = 0
      },
    },

    render: ({ text = '' }) => {
      const { container } = component
      const html = sanitizeHtml(text)
      if (html !== container.innerHTML) {
        container.innerHTML = html
      }
    },
  })

  return component
}
