import { Component } from '../lib/component.js'

type InputEvents = {
  input: { value: string }
}

export class Input extends Component<InputEvents> {
  constructor() {
    super('input', {
      oninput: (e: Event) => {
        this.emit('input', { value: (e.target as HTMLInputElement).value })
      },
    })
  }

  render(props: { value?: string }) {
    if (props.value !== undefined) {
      ; (this.container as HTMLInputElement).value = props.value
    }
  }
}
