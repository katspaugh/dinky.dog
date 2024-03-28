import { Component, el } from '../utils/dom.js'

export function Menu(title = '', className = '') {
  const details = el('details', { tabIndex: -1, className })
  const summary = el('summary', { tabIndex: 0 }, title)
  const ul = el('ul')

  return Component({
    container: details,

    children: [summary, ul],

    props: {
      onclick: (e) => {
        if (e.target === summary) {
          details.focus()
        }
      },

      onblur: () => {
        if (details.open) {
          setTimeout(() => {
            details.open = false
          }, 300)
        }
      },
    },

    render: ({ items = [] }) => {
      items.forEach(({ content, href = '', onClick, separator = false }) => {
        if (typeof content === 'string') {
          const a = el('a', {}, content.slice(0, 30))
          if (href) a.href = href
          if (a.href === location.href) {
            a.classList.add('active')
          }
          content = a
        }

        ul.appendChild(
          el(
            'li',
            {
              onclick: onClick,
            },
            content,
          ),
        )

        if (separator) {
          ul.appendChild(el('hr'))
        }
      })
    },
  })
}
