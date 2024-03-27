import { Component, css } from '../utils/dom.js'
import { sanitizeHtml } from '../utils/sanitize-html.js'

const INITIAL_WIDTH = 160
const INITIAL_HEIGHT = 75

export function EditableText({ onInput }) {
  let lastValue = ''
  let resetSize = false

  const update = (html) => {
    component.container.innerHTML = html
  }

  const component = Component({
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

      onblur: () => {
        update(lastValue)
        component.container.scrollLeft = 0

        if (lastValue && !resetSize) {
          resetSize = true
          css(component.container, {
            minWidth: 0,
            minHeight: 0,
          })
        }
      },
    },

    render: ({ text = '' }) => {
      const { container } = component
      if (text !== lastValue) {
        lastValue = text
        update(lastValue)
      }

      if (!resetSize && !text) {
        css(container, {
          minWidth: `${INITIAL_WIDTH}px`,
          minHeight: `${INITIAL_HEIGHT}px`,
        })
      }
    },
  })

  return component
}
