import { Component } from '../utils/dom.js'
import { sanitizeHtml } from '../utils/sanitize-html.js'

export function EditableText({ onInput }) {
  let lastValue = ''

  const update = (html) => {
    component.container.innerHTML = html
  }

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
        const html = sanitizeHtml(component.container.innerHTML)
        lastValue = html
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

      onpaste: () => {
        requestAnimationFrame(() => {
          update(lastValue)
        })
      },

      onblur: () => {
        update(lastValue)
        component.container.scrollLeft = 0
      },
    },

    render: ({ text = '' }) => {
      const { container } = component
      if (text !== lastValue) {
        lastValue = text
        update(lastValue)
      }
    },
  })

  return component
}
