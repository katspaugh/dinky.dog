import { el } from './dom.js'
import { Stream } from './stream.js'

type GeneralEventTypes = {
  [EventName: string]: unknown
}

export class Component<EventTypes extends GeneralEventTypes = GeneralEventTypes> {
  public input: Stream
  public output: Stream
  public container: HTMLElement

  constructor(...args: Parameters<typeof el>) {
    this.input = new Stream()
    this.output = new Stream()

    this.container = el(args[0] ?? 'div', args[1], args[2])

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

  public on<T extends keyof EventTypes>(event: T, listener: (eventData: EventTypes[T]) => void) {
    return this.output.subscribe((props) => {
      if (event in props) {
        listener(props[event])
      }
    })
  }

  protected emit<T extends keyof EventTypes>(event: T, eventData: EventTypes[T]) {
    this.output.next({ [event]: eventData })
  }
}
