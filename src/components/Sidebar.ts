import { Component } from '../lib/component.js'
import { css } from '../lib/dom.js'
import { getSavedStates, makeUrl } from '../lib/persist.js'
import { sanitizeHtml } from '../lib/sanitize-html.js'
import { Button } from './Button.js'
import { Input } from './Input.js'
import { Menu } from './Menu.js'

type SidebarProps = {
  title: string
}

type SidebarEvents = {
  titleChange: { title: string }
}

export class Sidebar extends Component<SidebarProps, SidebarEvents> {
  private input: Input

  constructor() {
    const input = new Input()
    const menu = new Menu()
    const fixedMenu = new Menu()

    const button = new Button()
    button.container.innerHTML = '<img src="/images/dinky-small.png" alt="Dinky Dog" width="20px" height="auto" />'
    css(button.container, {
      padding: '9px 10px 5px',
      position: 'relative',
      zIndex: '3',
    })

    const heading = new Component('h1', {
      textContent: 'Dinky Dog',
      style: {
        fontSize: '22px',
        margin: '0 0 20px',
        padding: '10px 10px 20px',
        borderBottom: '1px solid #ddd',
      },
    })

    const drawer = new Component(
      'div',
      {
        style: {
          width: '300px',
          height: '100vh',
          padding: '10px',
          transition: 'transform 0.2s',
          transform: 'translateX(100%)',
          backgroundColor: '#f5f5f5',
          pointerEvents: 'all',
          boxShadow: '0 0 10px rgba(0, 0, 0, 0.1)',
          display: 'flex',
          flexDirection: 'column',
          position: 'absolute',
          top: '0',
          right: '0',
          zIndex: '2',
        },
      },
      [heading.container, menu.container, fixedMenu.container],
    )

    super(
      'div',
      {
        style: {
          display: 'flex',
          gap: '10px',
          padding: '10px',
          position: 'fixed',
          right: '0',
          top: '0',
          zIndex: '1000',
          pointerEvents: 'none',
        },
      },
      [input.container, button.container, drawer.container],
    )

    let isExpanded = false

    button.on('click', () => {
      isExpanded = !isExpanded
      drawer.container.style.transform = isExpanded ? 'translateX(0)' : 'translateX(100%)'
      button.container.style.boxShadow = isExpanded ? '' : '1px 1px #000'

      this.updateMenu(menu)
    })

    input.on('change', ({ value }) => {
      const title = sanitizeHtml(value)
      this.setProps({ title })
      this.emit('titleChange', { title })
    })

    fixedMenu.setProps({
      items: [
        { text: 'About', href: makeUrl('about-9315ba924c9d16e632145116d69ae72a') },
        { text: 'Terms of service', href: '/terms.html' },
        { text: 'Privacy policy', href: '/privacy.html' },
        { text: 'GitHub', href: 'https://github.com/katspaugh/dinky.dog' },
      ],
    })

    css(fixedMenu.container, {
      marginTop: '20px',
      paddingTop: '20px',
      borderTop: '1px solid #ddd',
    })

    css(menu.container, {
      flex: '1',
      overflowY: 'auto',
    })

    this.input = input
  }

  private updateMenu(menu: Menu) {
    const savedStates = getSavedStates()
    if (savedStates) {
      const items = savedStates.map((state) => {
        return {
          text: state.title,
          href: makeUrl(state.id),
        }
      })
      menu.setProps({ items })
    }
  }

  setProps(props: SidebarProps) {
    super.setProps(props)

    if (props.title) {
      this.input.setProps({ value: props.title })
    }
  }

  render() {
    const { title } = this.props
    if (title) {
      document.title = `Dinky Dog — ${title}`
    }
  }
}
