export function css(element: HTMLElement | SVGElement, style: Partial<CSSStyleDeclaration>) {
  for (let key in style) {
    element.style[key] = style[key] as string
  }
}

export function el<T extends keyof HTMLElementTagNameMap>(
  element: T | HTMLElementTagNameMap[T],
  props?: Omit<Partial<HTMLElementTagNameMap[T]>, 'style'> & { style?: Partial<CSSStyleDeclaration> },
  children?: HTMLElement | string | Array<HTMLElement | string>,
): HTMLElementTagNameMap[T] {
  const htmlEl = element instanceof HTMLElement ? element : document.createElement(element)

  if (props) {
    for (let key in props) {
      if (key === 'style') {
        if (typeof props[key] === 'object') {
          css(htmlEl, props[key] as Partial<CSSStyleDeclaration>)
        } else if (typeof props[key] === 'string') {
          htmlEl.setAttribute('style', props[key] as string)
        }
      } else {
        htmlEl[key] = props[key]
      }
    }
  }

  if (children) {
    if (!Array.isArray(children)) children = [children]

    children.forEach((child) => {
      let childEl: HTMLElement | Text
      if (typeof child === 'string') {
        childEl = document.createTextNode(child)
      } else {
        childEl = child
      }
      htmlEl.appendChild(childEl)
    })
  }

  return htmlEl
}

export function svgEl(tagName: string, props: Record<string, any>) {
  const el = document.createElementNS('http://www.w3.org/2000/svg', tagName)
  for (let key in props) {
    el[key] = props[key]
  }
  return el
}

export function Component<T extends keyof HTMLElementTagNameMap>({
  render,
  destroy,
  props,
  style,
  children,
  container,
  tag = 'div',
}: {
  render?: (...args: any[]) => void
  destroy?: () => void
  props?: Partial<HTMLElementTagNameMap[T]>
  style?: Partial<CSSStyleDeclaration>
  children?: Array<HTMLElement | string>
  container?: HTMLElement
  tag?: T | 'div'
}) {
  container = el(container ?? el(tag), { ...props, style }, children)

  return {
    container,

    render(...args) {
      if (!container) {
        throw new Error('Component has been destroyed')
      }
      if (render) render(...args)
      return container
    },

    destroy() {
      if (destroy) destroy()
      if (container) {
        container.remove()
        container = undefined
      }
    },
  }
}
