import { el } from './dom.js'
import { Stream } from './stream.js'

export class Component<T extends HTMLElement = HTMLElement> {
  public input: Stream
  public output: Stream
  public container: T

  // constructor type typeof el
  constructor(...args: Parameters<typeof el>) {
    this.input = new Stream()
    this.output = new Stream()

    this.container = el(args[0] ?? 'div', args[1], args[2]) as T

    this.input.subscribe((props) => {
      this.render(props)
    })
  }

  public render(_props: any) {
    // render the component
  }

  protected onDestroy() {
    // cleanup
  }

  public destroy() {
    if (!this.container) return
    this.container.remove()
    delete this.container
    this.input.destroy()
    this.output.destroy()
    this.onDestroy()
  }
}
