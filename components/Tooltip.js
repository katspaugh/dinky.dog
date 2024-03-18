import { Component } from '../utils/dom.js'

export function Tooltip() {
  let expireTimer = null
  let showTimer = null

  const component = Component({
    style: {
      position: 'absolute',
      zIndex: 1000,
      padding: '8px',
      background: '#fafafa',
      color: '#333',
      border: '1px solid #ccc',
      boxShadow: '2px 2px 4px rgba(0,0,0,0.2)',
      pointerEvents: 'none',
    },

    render: ({ x, y, content = '', delay = 0, expire = 0 }) => {
      const { container } = component

      expireTimer && clearTimeout(expireTimer)
      showTimer && clearTimeout(showTimer)

      if (!content) {
        container.style.display = 'none'
        container.innerHTML = ''
        return container
      }

      showTimer = setTimeout(() => {
        if (x != null && y != null) {
          Object.assign(container.style, {
            left: x + 'px',
            top: y + 'px',
          })
        }

        container.innerHTML = content
        container.style.display = ''

        if (expire) {
          expireTimer = setTimeout(() => {
            container.style.display = 'none'
          }, expire)
        }
      }, delay)
    },
  })

  return component
}
