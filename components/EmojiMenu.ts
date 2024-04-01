import { Component, el } from '../utils/dom.js'
import { getMatchingEmoji, isCompleteEmoji } from '../utils/emoji-parse.js'
import { Tooltip } from './Tooltip.js'

function getCaretPosition() {
  let x = 0
  let y = 0
  const selection = window.getSelection()
  if (selection.rangeCount > 0) {
    const range = selection.getRangeAt(0).cloneRange()
    if (range.getClientRects) {
      range.collapse(true)
      const rect = range.getClientRects()[0]
      if (rect) {
        x = rect.left
        y = rect.top
      }
    }

    // Adjusting for scroll
    x += window.scrollX
    y += window.scrollY
  }
  return { x, y }
}

export function EmojiMenu() {
  const tooltip = Tooltip()
  const menu = el('ul', { className: 'emoji-menu' })
  let lastText = ''
  let lastMatch

  const onkeydown = (e: KeyboardEvent) => {
    if (!lastMatch) return

    if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
      e.preventDefault()
      const selected = menu.querySelector('li:focus')
      const next = e.key === 'ArrowDown' ? selected?.nextElementSibling : selected?.previousElementSibling
      if (next) {
        next.focus()
      } else {
        menu.children[0].focus()
      }
    } else if (e.key === 'Enter') {
      const selected = menu.querySelector('li:focus')
      if (selected) {
        selected.click()
        e.preventDefault()
        e.stopPropagation()
      }
    } else if (e.key === 'Escape') {
      tooltip.render({})
    }
  }

  document.addEventListener('keydown', onkeydown)

  return Component({
    children: [tooltip.container],

    render: ({ text, onSelect }: { text?: string; onSelect?: (shortCode: string, emoji: string) => void }) => {
      if (lastText === text) return
      lastText = text

      const matchingEmoji = text && getMatchingEmoji(text)
      if (!matchingEmoji) {
        lastMatch = null
        tooltip.render({})
        return
      }

      if (isCompleteEmoji(text, matchingEmoji[0][0])) {
        onSelect(...matchingEmoji)
        tooltip.render({})
        return
      }

      if (
        !lastMatch ||
        matchingEmoji.length !== lastMatch.length ||
        matchingEmoji.some((item, i) => item[1] !== lastMatch[i][1])
      ) {
        lastMatch = matchingEmoji
        menu.innerHTML = ''
        matchingEmoji.forEach((item) =>
          menu.append(
            el(
              'li',
              {
                tabIndex: 0,
                onclick: () => onSelect(...item),
              },
              item[1] + ' ' + item[0],
            ),
          ),
        )
      }

      const { x, y } = getCaretPosition()

      tooltip.render({
        x,
        y: y + 20,
        content: menu,
      })
    },

    destroy: () => { },
  })
}
