import { Component } from '../lib/component.js'
import { css } from '../lib/dom.js'
import { getClientId, getSavedStates } from '../lib/persist.js'
import { sanitizeHtml } from '../lib/sanitize-html.js'
import { randomId } from '../lib/utils.js'
import { Button } from './Button.js'
import { Drawer } from './Drawer.js'
import { LockButton } from './LockButton.js'
import { Colorpicker } from './Colorpicker.js'
import { Input } from './Input.js'
import { Menu } from './Menu.js'
import { PeerList, type PeerListProps } from './PeerList.js'
import { makeUrl } from '../lib/url.js'

type SidebarProps = {
  title: string
  isLocked?: boolean
  creator?: string
  backgroundColor?: string
  peers?: PeerListProps['peers']
}

export type SidebarEvents = {
  titleChange: { title: string }
  backgroundColorChange: { backgroundColor: string }
  lockChange: { isLocked: boolean }
}

class Heading extends Component<{}, {}> {
  constructor(level: 'h1' | 'h2', textContent: string) {
    super(level, {
      textContent,
      style: {
        fontSize: '22px',
        margin: '10px 10px 0',
      },
    })
  }
}

class Divider extends Component<{}, {}> {
  constructor() {
    super('hr', {
      style: {
        margin: '20px 0',
        border: 'none',
        borderBottom: '1px solid #ddd',
      },
    })
  }
}

class Flexbox extends Component<{}, {}> {
  constructor(children: Component<{}, {}>[]) {
    super(
      'div',
      {
        style: {
          display: 'flex',
          gap: '10px',
        },
      },
      children,
    )
  }
}

class DinkyButton extends Button {
  constructor(styles?: Partial<CSSStyleDeclaration>) {
    super('')
    css(this.container, {
      width: '40px',
      height: '40px',
      backgroundImage: `url('/images/dinky-small.png')`,
      backgroundRepeat: 'no-repeat',
      backgroundPosition: 'center',
      backgroundSize: '65%',
      ...styles,
    })
  }
}

export class Sidebar extends Component<SidebarProps, SidebarEvents> {
  private input: Input
  private lockButton: LockButton
  private colorpicker: Colorpicker
  private peerList: PeerList

  constructor() {
    const input = new Input()

    const menu = new Menu()
    css(menu.container, {
      flex: '1',
      overflowY: 'auto',
    })

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

    const heading = new Heading('h1', 'Dinky Dog')

    const button = new DinkyButton()

    const drawerButton = new DinkyButton({
      position: 'absolute',
      top: '10px',
      right: '10px',
      boxShadow: 'none',
    })

    const lockButton = new LockButton()

    const buttonsGroup = new Flexbox([lockButton])

    const drawer = new Drawer(
      [heading, new Divider(), buttonsGroup, new Divider(), menu, new Divider(), fixedMenu, drawerButton],
      button,
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
      [input, button, drawer, colorpicker, peerList],
    )

    button.on('click', () => {
      this.updateMenu(menu)
      drawer.open()
    })

    drawerButton.on('click', () => {
      drawer.close()
    })

    input.on('change', ({ value }) => {
      const title = sanitizeHtml(value)
      this.setProps({ title })
      this.emit('titleChange', { title })
    })

    fixedMenu.setProps({
      items: [
        { text: 'About', href: makeUrl('about-9315ba924c9d16e632145116d69ae72a') },
        { text: 'Terms of service', href: makeUrl('terms-of-service_43a7a9fa13bb3d0c') },
        { text: 'Privacy policy', href: makeUrl('privacy-policy_074505b43d5c0b97') },
        { text: 'GitHub', href: 'https://github.com/katspaugh/dinky.dog' },
      ],
    })

    lockButton.on('toggle', (params) => {
      this.emit('lockChange', params)
    })

    this.input = input
    this.colorpicker = colorpicker
    this.peerList = peerList
    this.lockButton = lockButton
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

    if (props.isLocked !== undefined) {
      this.lockButton.setProps({ isLocked: props.isLocked })
        ; (this.input.container as HTMLInputElement).disabled = props.isLocked
    }
  }

  render({ creator }) {
    if (creator !== undefined) {
      ; (this.lockButton.container as HTMLButtonElement).disabled = getClientId() !== creator
    }
  }
}
