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
          }, 100)
        }
      },
    },

    children: [summary, ul],

    render: ({ items = [] }) => {
      items.forEach(({ content, href = '', onClick, separator = false }) => {
        const li = el('li')
        if (typeof content === 'string') {
          const a = el('a', { href }, content.slice(0, 30))
          content = a
        }
        if (content) {
          li.appendChild(content)
        }
        li.onclick = onClick
        ul.appendChild(li)
        if (separator) {
          ul.appendChild(el('hr'))
        }
      })
    },
  })

  return component
}
