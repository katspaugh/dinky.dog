import { throttle } from '../utils/debounce.js'
import { Component, el, css } from '../utils/dom.js'
import { replaceEmoji } from '../utils/emoji-parse.js'
import { sanitizeHtml } from '../utils/sanitize-html.js'
import { LinkOverlay } from './LinkOverlay.js'
import { EmojiMenu } from './EmojiMenu.js'

const INITIAL_WIDTH = 130
const INITIAL_HEIGHT = 55
const INPUT_THROTTLE = 100

const emojiMenu = EmojiMenu()
document.body.append(emojiMenu.container)

export function EditableText({ onInput }: { onInput?: (html: string) => void }) {
  let lastValue = ''
  let resetSize = false
  let isClicked = false

  const linkOverlay = LinkOverlay()

  const onEmojiSelect = (shortCode: string, emoji: string) => {
    editor.innerHTML = replaceEmoji(editor.innerHTML, shortCode, emoji)
    onEdit()

    // Put the caret at the end of the editor
    const range = document.createRange()
    range.selectNodeContents(editor)
    range.collapse(false)
    const selection = window.getSelection()
    selection.removeAllRanges()
    selection.addRange(range)
  }

  const onEdit = () => {
    const html = sanitizeHtml(editor.innerHTML)
    lastValue = html
    onInput && onInput(html)

    // Text before the caret
    const text = editor.textContent.slice(0, window.getSelection().focusOffset)
    emojiMenu.render({ text, onSelect: onEmojiSelect })
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
      isClicked = false

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
      isClicked = true

      const link = (e.target as HTMLElement).closest('a')
      if (link) {
        e.preventDefault()
        window.open(link.href, '_blank')
      }
    },

    onpointermove: (e) => {
      if (isClicked) {
        e.stopPropagation()
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
