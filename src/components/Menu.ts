import { Component } from '../lib/component.js'
import { el } from '../lib/dom.js'

type MenuProps = {
  items: Array<{
    text: string
    href: string
  }>
}

export class Menu extends Component<MenuProps, {}> {
  constructor() {
    super('ul', {
      style: {
        listStyle: 'none',
        margin: '0',
        padding: '0',
      },
    })
  }

  render() {
    this.container.innerHTML = ''

    this.props.items.forEach((item) => {
      const a = el('a', {
        href: item.href,
        target: item.href.startsWith('http') && !item.href.startsWith(window.location.origin) ? '_blank' : '',
        textContent: item.text,
        style: {
          display: 'block',
          padding: '10px',
          color: 'inherit',
          textDecoration: 'none',
          whiteSpace: 'nowrap',
          width: '100%',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
        },
      })
      const li = el(
        'li',
        {
          style: {
            borderRadius: '4px',
          },
        },
        [a],
      )
      this.container.appendChild(li)
    })
  }
}
