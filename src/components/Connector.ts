import { Component } from '../lib/component.js'

export type ConnectorEvents = {
  click: {}
}

export class Connector extends Component<{}, ConnectorEvents> {
  constructor() {
    super('button', {
      style: {
        borderRadius: '100%',
        backgroundColor: 'var(--accent-color)',
        width: '20px',
        height: '20px',
        cursor: 'pointer',
        border: 'none',
        padding: '0',
        position: 'absolute',
        zIndex: '2',
        right: '0',
        top: '50%',
        marginTop: '-10px',
        marginRight: '-10px',
      },

      onclick: (e) => {
        e.stopPropagation()
        e.preventDefault()
        this.emit('click', {})
      },
    })
  }
}
