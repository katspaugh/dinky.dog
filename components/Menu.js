export function Menu(title = '', className = '') {
  const container = document.createElement('details')
  container.tabIndex = -1
  if (className) {
    container.className = className
  }

  const summary = document.createElement('summary')
  summary.tabIndex = 0
  summary.textContent = title
  container.appendChild(summary)

  const ul = document.createElement('ul')
  container.appendChild(ul)

  container.onclick = (e) => {
    if (e.target === summary) {
      container.focus()
    }
  }

  container.onblur = () => {
    if (container.open) {
      setTimeout(() => {
        container.open = false
      }, 100)
    }
  }

  return {
    container,

    render: ({ items = [] }) => {
      items.forEach(({ content, href, onClick, separator = false }) => {
        const li = document.createElement('li')

        if (typeof content === 'string') {
          const a = document.createElement('a')
          if (href) a.href = href
          a.textContent = content.slice(0, 30)
          content = a
        }
        if (content) {
          li.appendChild(content)
        }
        li.onclick = onClick
        ul.appendChild(li)
        if (separator) {
          ul.appendChild(document.createElement('hr'))
        }
      })

      return container
    },

    destroy: () => container.remove(),
  }
}
