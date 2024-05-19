import { Component } from '../lib/component.js'

export class Connector extends Component {
  constructor() {
    super('button', {
      style: {
        borderRadius: '100%',
        backgroundColor: 'red',
        boxSizing: 'border-box',
        width: '20px',
        height: '20px',
        cursor: 'pointer',
        border: 'none',
        padding: '0',
        position: 'absolute',
        right: '0',
        top: '50%',
        transform: 'translate(50%, -50%)',
      },

      onclick: (e) => {
        e.stopPropagation()
        e.preventDefault()
        const rect = this.container.getBoundingClientRect()
        this.output.next({ event: 'connector', x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 })
      },
    })
  }
}
