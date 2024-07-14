import { Component } from '../lib/component.js'

type ButtonProps = {
  text: string
}

type ButtonEvents = {
  click: {}
}

export class Button extends Component<ButtonProps, ButtonEvents> {
  constructor(text: string) {
    super('button', {
      style: {
        width: 'fit-content',
        boxShadow: '1px 1px #000',
        border: '1px solid #333',
        borderRadius: '4px',
        padding: '0.5em 0.7em',
        fontSize: '16px',
        cursor: 'pointer',
        backgroundColor: 'var(--button-color)',
        transition: 'box-shadow 0.2s, transform 0.1s',
        pointerEvents: 'all',
        whiteSpace: 'nowrap',
        color: 'inherit',
      },
      onclick: () => {
        this.emit('click', {})
      },
    })

    if (text) {
      this.setProps({ text })
    }
  }

  render() {
    this.container.textContent = this.props.text
  }
}
