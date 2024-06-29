import { el } from './dom.js'
import EventEmitter, { type GeneralEventTypes } from './event-emitter.js'

type GeneralPropTypes = {
  [PropName: string]: unknown
}

export class Component<
  PropTypes extends GeneralPropTypes,
  EventTypes extends GeneralEventTypes,
> extends EventEmitter<EventTypes> {
  private _container: HTMLElement
  protected props: PropTypes = {} as PropTypes

  constructor(...args: Parameters<typeof el>) {
    super()
    this.container = el(args[0] ?? 'div', args[1], args[2])
  }

  public get container(): HTMLElement {
    return this._container
  }

  protected set container(value: HTMLElement) {
    this._container = value
  }

  public getProps(): PropTypes {
    return this.props
  }

  public setProps(props: Partial<PropTypes>) {
    const newProps = { ...this.props, ...props }
    if (Object.keys(newProps).every((key) => newProps[key] === this.props[key])) return
    this.props = newProps

    requestAnimationFrame(() => {
      this.render()
    })
  }

  protected render() {
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
