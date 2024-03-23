const svgTags = ['svg', 'path']

export function css(el, props) {
  for (let key in props) {
    el.style[key] = props[key]
  }
}

export function el(tagName, props, children) {
  const el = svgTags.includes(tagName)
    ? document.createElementNS('http://www.w3.org/2000/svg', tagName)
    : document.createElement(tagName)

  if (props) {
    for (let key in props) {
      if (key === 'style' && typeof props[key] === 'object') {
        css(el, props[key])
      } else {
        el[key] = props[key]
      }
    }
  }

  if (children) {
    if (!Array.isArray(children)) children = [children]

    children.forEach((child) => {
      if (typeof child === 'string') {
        child = document.createTextNode(child)
      }
      el.appendChild(child)
    })
  }

  return el
}

export function Component({ render, destroy, tag = 'div', props, style, children, container }) {
  if (container) {
    if (children) container.append(...children)
    if (style) css(container, style)
    if (props) {
      for (let key in props) {
        container[key] = props[key]
      }
    }
  } else {
    container = el(tag, { ...props, style }, children)
  }

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
      container.remove()
      container = null
    },
  }
}
