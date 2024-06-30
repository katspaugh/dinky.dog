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
        border: 'none',
        padding: '0',
        position: 'absolute',
        zIndex: '2',
        right: '0',
        top: '50%',
        marginTop: '-10px',
        marginRight: '-10px',
        cursor: `url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='40' height='48' viewport='0 0 100 100' style='fill:black;font-size:24px;'><text y='50%'>∿</text></svg>") 0 16, pointer`,
      },

      tabIndex: 4,

      onclick: (e) => {
        e.stopPropagation()
        e.preventDefault()
        this.emit('click', {})
      },
    })
  }
}
