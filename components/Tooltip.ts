import { Component } from '../utils/dom.js'

export function Tooltip() {
  let expireTimer: ReturnType<typeof setTimeout> | null = null
  let showTimer: ReturnType<typeof setTimeout> | null = null

  const component = Component({
    props: {
      className: 'tooltip',
    },

    render: ({ x, y, content, delay = 0, expire = 0 }) => {
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

        container.innerHTML = ''
        container.append(content)
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
