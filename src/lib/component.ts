import { el, insertCssClass } from './dom.js'
import EventEmitter, { type GeneralEventTypes } from './event-emitter.js'

type GeneralPropTypes = {
  [PropName: string]: unknown
}

type ComponentEvents = {
  destroy: {}
}

export class Component<PropTypes extends GeneralPropTypes, EventTypes extends GeneralEventTypes> extends EventEmitter<
  EventTypes & ComponentEvents
> {
  private _container: HTMLElement
  protected props: PropTypes = {} as PropTypes

  constructor(...args: Parameters<typeof el>) {
    super()

    const tag = args[0] ?? 'div'
    let props = args[1]
    const children = args[2]
    const componentName = this.constructor.name

    if (props && 'style' in props) {
      const css = props.style
      insertCssClass(componentName, css)
      props = { ...props, style: undefined }
    }

    this.container = el(tag, props, children)
    this.container.classList.add(componentName)
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

    this.render()
  }

  protected render() {
    // render the component
  }

  public destroy() {
    if (!this.container) return
    this.container.remove()
    delete this.container
    this.emit('destroy', {} as EventTypes['destroy'])
    this.unAll()
  }
}
