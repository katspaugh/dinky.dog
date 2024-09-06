import { Component } from '../lib/component.js'
import { onEvent } from '../lib/dom.js'

type DrawerProps = {
  isOpen: boolean
}

export class Drawer extends Component<DrawerProps, {}> {
  constructor(children: Component<{}, {}>[], openerButton: Component<{}, {}>) {
    super(
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
      children,
    )

    const unsubscribe = onEvent(document.body, 'click', (event) => {
      if (
        event.target !== this.container &&
        event.target !== openerButton.container &&
        !this.container.contains(event.target as Node)
      ) {
        this.close()
      }
    })

    this.on('destroy', unsubscribe)
  }

  open() {
    this.setProps({ isOpen: true })
  }

  close() {
    this.setProps({ isOpen: false })
  }

  render() {
    this.container.style.transform = this.props.isOpen ? 'translateX(0)' : ''
  }
}
