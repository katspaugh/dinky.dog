import { Component } from '../lib/component.js'

type InputEvents = {
  input: { value: string }
  change: { value: string }
}

type InputProps = {
  value?: string
}

export class Input extends Component<InputProps, InputEvents> {
  private lastInput = ''

  constructor() {
    super('input', {
      // @ts-ignore
      size: 30,

      placeholder: 'Untitled',

      style: {
        padding: '5px',
        border: 'none',
        fontSize: '16px',
        borderBottom: '2px dashed #333',
        borderRadius: '4px',
        backgroundColor: 'rgba(255, 255, 255, 0.4)',
        outline: 'none',
        pointerEvents: 'all',
      },

      oninput: (e: Event) => {
        const value = (e.target as HTMLInputElement).value
        if (value !== this.lastInput) {
          this.lastInput = value
          this.emit('input', { value })
        }
      },

      onchange: (e: Event) => {
        const value = (e.target as HTMLInputElement).value
        this.emit('change', { value })
      },
    })
  }

  render() {
    const { value } = this.props
    if (value !== this.lastInput) {
      this.lastInput = value
        ; (this.container as HTMLInputElement).value = value
    }
  }
}
