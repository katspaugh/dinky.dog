import { Component } from '../lib/component.js'
import { css } from '../lib/dom.js'
import { getSavedStates, makeUrl } from '../lib/persist.js'
import { sanitizeHtml } from '../lib/sanitize-html.js'
import { randomId } from '../lib/utils.js'
import { Button } from './Button.js'
import { Colorpicker } from './Colorpicker.js'
import { Input } from './Input.js'
import { Menu } from './Menu.js'
import { PeerList, type PeerListProps } from './PeerList.js'

type SidebarProps = {
  title: string
  backgroundColor?: string
  peers?: PeerListProps['peers']
}

export type SidebarEvents = {
  titleChange: { title: string }
  backgroundColorChange: { backgroundColor: string }
}

class Heading extends Component<{}, {}> {
  constructor() {
    super('h1', {
      textContent: 'Dinky Dog',
      style: {
        fontSize: '22px',
        margin: '0 0 20px',
        padding: '10px 10px 20px',
        borderBottom: '1px solid #ddd',
      },
    })
  }
}

class Drawer extends Component<{}, {}> {
  constructor() {
    super('div', {
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
    })
  }
}

const makeButton = (styles?: Partial<CSSStyleDeclaration>) => {
  const button = new Button()
  button.container.innerHTML = '<img src="/images/dinky-small.png" alt="Dinky Dog" width="20px" height="auto" />'
  css(button.container, {
    padding: '9px 10px 5px',
    ...styles,
  })
  return button
}

export class Sidebar extends Component<SidebarProps, SidebarEvents> {
  private input: Input
  private colorpicker: Colorpicker
  private peerList: PeerList

  constructor() {
    const input = new Input()
    const menu = new Menu()
    const fixedMenu = new Menu()
    const peerList = new PeerList()

    const colorpicker = new Colorpicker()
    css(colorpicker.container, {
      position: 'fixed',
      bottom: '10px',
      right: '10px',
      zIndex: '1',
      pointerEvents: 'all',
    })
    colorpicker.on('change', ({ color }) => {
      this.emit('backgroundColorChange', { backgroundColor: color })
    })

    const heading = new Heading()

    const button = makeButton()

    const drawerButton = makeButton({
      position: 'absolute',
      top: '10px',
      right: '10px',
      boxShadow: 'none',
    })

    const drawer = new Drawer()
    drawer.container.append(heading.container, menu.container, fixedMenu.container, drawerButton.container)

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
      [input.container, button.container, drawer.container, colorpicker.container, peerList.container],
    )

    button.on('click', () => {
      drawer.container.style.transform = 'translateX(0)'
      this.updateMenu(menu)
    })

    drawerButton.on('click', () => {
      drawer.container.style.transform = ''
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
    this.colorpicker = colorpicker
    this.peerList = peerList

    this.on('destroy', () => {
      heading.destroy()
      colorpicker.destroy()
      input.destroy()
      button.destroy()
      drawerButton.destroy()
      drawer.destroy()
      menu.destroy()
      fixedMenu.destroy()
      peerList.destroy()
    })
  }

  private updateMenu(menu: Menu) {
    let items = [
      {
        text: '+ New',
        href: makeUrl(randomId()),
      },
    ]

    const savedStates = getSavedStates()
    if (savedStates) {
      items = items.concat(
        savedStates.map((state) => {
          return {
            text: state.title,
            href: makeUrl(state.id, state.title),
          }
        }),
      )
    }
    menu.setProps({ items })
  }

  setProps(props: Partial<SidebarProps>) {
    super.setProps(props)

    if (props.title) {
      this.input.setProps({ value: props.title })
    }

    if (props.backgroundColor) {
      this.colorpicker.setProps({ color: props.backgroundColor })
    }

    if (props.peers) {
      this.peerList.setProps({ peers: props.peers })
    }
  }

  render() { }
}
