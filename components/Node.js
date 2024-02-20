import { makeDraggable } from '../draggable.js'

function makeNodeDraggable(el, onDrag, onDragEnd) {
  let left = null
  let top = null
  makeDraggable(
    el,
    (dx, dy) => {
      if (left == null) {
        const bbox = el.getBoundingClientRect()
        left = bbox.left
        top = bbox.top
      }

      left += dx
      top += dy
      Object.assign(el.style, {
        left: `${left}px`,
        top: `${top}px`,
      })
      onDrag(left, top)
    },
    undefined,
    onDragEnd,
  )
}

export function Node() {
  const div = document.createElement('div')
  div.className = 'module'

  const outputButton = document.createElement('button')
  Object.assign(outputButton.style, {
    left: '100%',
    top: '50%',
    transform: 'translateY(-50%)',
  })

  const inputs = []

  return {
    container: div,

    inputs,

    output: outputButton,

    render: ({
      id,
      x,
      y,
      label,
      children = null,
      inputsCount = 0,
      onClick = null,
      onDrag = null,
      onDragEnd = null,
    }) => {
      div.innerHTML = ''
      div.setAttribute('id', id)

      Object.assign(div.style, {
        left: `${x}px`,
        top: `${y}px`,
      })

      // Render label
      if (label) {
        const span = document.createElement('span')
        span.innerText = label
        Object.assign(span.style, {
          pointerEvents: 'none',
          userSelect: 'none',
        })
        div.appendChild(span)
      }

      // Render inputs
      for (let i = 0; i < inputsCount; i++) {
        const button = document.createElement('button')
        Object.assign(button.style, {
          left: '0',
          top: '50%',
          transform: 'translateY(-50%)',
        })
        button.setAttribute('id', `${id}-input-${i}`)
        div.appendChild(button)
        inputs.push(button)
      }

      // Render output
      outputButton.setAttribute('id', `${id}-output`)
      div.appendChild(outputButton)

      if (children) {
        children = Array.isArray(children) ? children : [children]
        children.forEach((el) => div.appendChild(el))
      }

      div.onclick = onClick

      if (onDrag) {
        makeNodeDraggable(div, onDrag, onDragEnd)
      }

      return div
    },
  }
}
