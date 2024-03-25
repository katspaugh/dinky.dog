import { Component, el } from '../utils/dom.js'

export function Menu(title = '', className = '') {
  const summary = el('summary', { tabIndex: 0 }, title)
  const ul = el('ul')

  const component = Component({
    tag: 'details',

    props: {
      tabIndex: -1,

      className,

      onclick: (e) => {
        if (e.target === summary) {
          component.container.focus()
        }
      },

      onblur: () => {
        if (component.container.open) {
          setTimeout(() => {
            component.container.open = false
          }, 300)
        }
      },
    },

    children: [summary, ul],

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

  return component
}
