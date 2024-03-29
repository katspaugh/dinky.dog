import { throttle } from '../utils/debounce.js'
import { Component, el, css } from '../utils/dom.js'
import { sanitizeHtml } from '../utils/sanitize-html.js'
import { LinkOverlay } from './LinkOverlay.js'

const INITIAL_WIDTH = 130
const INITIAL_HEIGHT = 55
const INPUT_THROTTLE = 300

export function EditableText({ onInput }: { onInput?: (html: string) => void }) {
  let lastValue = ''
  let resetSize = false

  const linkOverlay = LinkOverlay()

  const onEdit = () => {
    const html = sanitizeHtml(editor.innerHTML)
    lastValue = html
    onInput && onInput(html)
  }

  const editor = el('div', {
    tabIndex: 0,

    contentEditable: onInput ? 'true' : 'false',

    oninput: throttle(onEdit, INPUT_THROTTLE),

    onkeydown: (e) => {
      if (e.key === 'Escape') {
        editor.blur()
      } else if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault()
        editor.blur()
      }
    },

    onfocus: () => {
      linkOverlay.render({})
    },

    onblur: () => {
      onEdit()
      update(lastValue)
      editor.scrollLeft = 0

      if (lastValue && !resetSize) {
        resetSize = true
        css(editor, {
          minWidth: '0',
          minHeight: '0',
        })
      }
    },

    onclick: (e) => {
      const link = (e.target as HTMLElement).closest('a')
      if (link) {
        e.preventDefault()
        window.open(link.href, '_blank')
      }
    },
  })

  const update = (html: string) => {
    if (editor.innerHTML !== html) {
      editor.innerHTML = html
    }
    linkOverlay.render({ html })
  }

  return Component({
    children: [editor, linkOverlay.container],

    style: {
      position: 'relative',
    },

    render: ({ text = '', focus = false }) => {
      if (text !== lastValue) {
        lastValue = text
        update(lastValue)
      }

      if (!resetSize && !text) {
        css(editor, {
          minWidth: `${INITIAL_WIDTH}px`,
          minHeight: `${INITIAL_HEIGHT}px`,
        })
      }

      if (focus) {
        requestAnimationFrame(() => editor.focus())
      }
    },
  })
}
