import { el, insertCssClass } from './dom.js'
import EventEmitter, { type GeneralEventTypes } from './event-emitter.js'

type GeneralPropTypes = {
  [PropName: string]: unknown
}

type ComponentEvents = {
  destroy: {}
}

type ElementParams = Parameters<typeof el>

export class Component<PropTypes extends GeneralPropTypes, EventTypes extends GeneralEventTypes> extends EventEmitter<
  EventTypes & ComponentEvents
> {
  private _container: HTMLElement
  protected props: PropTypes = {} as PropTypes

  constructor(tag?: ElementParams[0], props?: ElementParams[1], children?: Component<{}, {}>[]) {
    super()

    const componentName = this.constructor.name

    if (props && 'style' in props) {
      const css = props.style
      insertCssClass(componentName, css)
      props = { ...props, style: undefined }
    }

    this.container = el(tag, props, children?.map((child) => child.container) as ElementParams[2])
    this.container.classList.add(componentName)

    if (children?.length) {
      this.on('destroy', () => {
        children.forEach((item) => item.destroy())
      })
    }
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
    const changedProps = Object.keys(props)
      .filter((key) => this.props[key] !== props[key])
      .reduce((acc, key) => {
        acc[key] = props[key]
        return acc
      }, {})
    const newProps = { ...this.props, ...changedProps }
    this.props = newProps
    this.render(changedProps)
  }

  protected render(_: Partial<PropTypes>) {
    // override this method in subclasses
  }

  public destroy() {
    if (!this.container) return
    this.container.remove()
    delete this.container
    this.emit('destroy', {} as EventTypes['destroy'])
    this.unAll()
  }
}
