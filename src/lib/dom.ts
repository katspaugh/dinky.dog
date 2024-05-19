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
  const htmlEl = typeof element === 'string' ? document.createElement(element) : element

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

export function svgEl(tagName: string) {
  return document.createElementNS('http://www.w3.org/2000/svg', tagName)
}

export function getRelativeCoords(e: MouseEvent) {
  const rect = (e.currentTarget as HTMLElement).getBoundingClientRect()
  return {
    x: e.clientX - rect.left,
    y: e.clientY - rect.top,
  }
}
