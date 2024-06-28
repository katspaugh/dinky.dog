import { el } from './dom.js'
import EventEmitter, { type GeneralEventTypes } from './event-emitter.js'

type GeneralPropTypes = {
  [PropName: string]: unknown
}

export class Component<
  PropTypes extends GeneralPropTypes,
  EventTypes extends GeneralEventTypes,
> extends EventEmitter<EventTypes> {
  public container: HTMLElement
  private props: PropTypes = {} as PropTypes

  constructor(...args: Parameters<typeof el>) {
    super()
    this.container = el(args[0] ?? 'div', args[1], args[2])
  }

  public getProps(): PropTypes {
    return this.props
  }

  public setProps(props: Partial<PropTypes>) {
    this.props = { ...this.props, ...props }
    this.render(this.props)
  }

  protected render(_props: PropTypes) {
    // render the component
  }

  protected onDestroy() {
    // cleanup
  }

  public destroy() {
    if (!this.container) return
    this.container.remove()
    delete this.container
    this.unAll()
    this.onDestroy()
  }
}
