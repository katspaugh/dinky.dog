import { Component } from '../lib/component.js'

export class Input extends Component<HTMLInputElement> {
  constructor() {
    super('input', {
      oninput: (e: Event) => {
        this.output.next({ value: (e.target as HTMLInputElement).value })
      },
    })
  }

  render(props: { value?: string }) {
    if (props.value !== undefined) {
      this.container.value = props.value
    }
  }
}
